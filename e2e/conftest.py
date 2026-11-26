"""Fixtures for the Coupon e2e suite: dev server, browser, per-test page with console capture, report.

Run from the project root:  python3 -m pytest e2e
Env: E2E_BASE_URL (default http://localhost:8443/), E2E_SCREENS (default /tmp/screens).
"""

import os
import socket
import struct
import subprocess
import time
import zlib
from pathlib import Path
from urllib.parse import urlparse

import pytest
from playwright.sync_api import sync_playwright

from helpers import full_shot, open_coupon_service

ROOT = Path(__file__).resolve().parent.parent
BASE_URL = os.environ.get("E2E_BASE_URL", "http://localhost:8443/")
SCREENS = Path(os.environ.get("E2E_SCREENS", "/tmp/screens"))
RESULTS: list[dict] = []


def _port_open(host: str, port: int) -> bool:
    with socket.socket() as s:
        s.settimeout(0.5)
        return s.connect_ex((host, port)) == 0


@pytest.fixture(scope="session")
def base_url():
    """Use the dev server if it's already running (Figma Make keeps one up); otherwise start one."""
    url = urlparse(BASE_URL)
    host, port = url.hostname or "localhost", url.port or 80
    if _port_open(host, port):
        yield BASE_URL
        return
    log = open(SCREENS / "dev-server.log", "w")
    proc = subprocess.Popen(
        ["npx", "vite", "--port", str(port), "--strictPort"],
        cwd=ROOT,
        stdout=log,
        stderr=subprocess.STDOUT,
        env={**os.environ, "PORT": str(port)},
        start_new_session=True,
    )
    try:
        deadline = time.time() + 90
        while not _port_open(host, port):
            if proc.poll() is not None or time.time() > deadline:
                raise RuntimeError(f"Dev server didn't start; see {SCREENS / 'dev-server.log'}")
            time.sleep(0.5)
        yield BASE_URL
    finally:
        os.killpg(proc.pid, 15)
        log.close()


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        b = p.chromium.launch(headless=True)
        yield b
        b.close()


@pytest.fixture(scope="session")
def files(tmp_path_factory):
    """Upload fixtures, generated so the suite has no binary files to keep in git."""
    d = tmp_path_factory.mktemp("files")

    def png(name: str, w: int, h: int, rgb: tuple[int, int, int]) -> Path:
        raw = b"".join(b"\x00" + bytes(rgb) * w for _ in range(h))
        chunk = lambda t, data: struct.pack(">I", len(data)) + t + data + struct.pack(">I", zlib.crc32(t + data) & 0xFFFFFFFF)
        path = d / name
        path.write_bytes(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", w, h, 8, 2, 0, 0, 0)) + chunk(b"IDAT", zlib.compress(raw)) + chunk(b"IEND", b""))
        return path

    codes = d / "codes.csv"
    codes.write_text("code\nE2E-0001\nE2E-0002\nE2E-0001\nE2E-0003\nE2E-0004\nE2E-0002\n", encoding="utf-8")
    contract = d / "contract.pdf"
    contract.write_bytes(b"%PDF-1.4\n% e2e mock\n")
    return {
        "square": png("square.png", 400, 400, (255, 97, 21)),
        "banner": png("banner.png", 716, 240, (37, 99, 235)),
        "logo": png("logo.png", 240, 240, (22, 163, 74)),
        "codes": codes,  # 4 unique codes, 2 duplicates
        "contract": contract,
    }


def pytest_sessionstart(session):
    SCREENS.mkdir(parents=True, exist_ok=True)
    # Only clear what earlier runs of this suite wrote.
    for f in list(SCREENS.glob("test_*")) + [SCREENS / "report.md"]:
        if f.is_file():
            f.unlink()


@pytest.fixture
def page(browser, base_url, request):
    context = browser.new_context(viewport={"width": 1440, "height": 1000}, locale="en-US", accept_downloads=True)
    pg = context.new_page()
    console: list[str] = []
    errors: list[str] = []

    def on_console(msg):
        console.append(f"[{msg.type}] {msg.text}")
        if msg.type == "error":
            errors.append(msg.text)

    def on_page_error(err):
        console.append(f"[pageerror] {err}")
        errors.append(str(err))

    pg.on("console", on_console)
    pg.on("pageerror", on_page_error)
    request.node.console_errors = errors
    request.node.shots = []
    counter = iter(range(1, 100))

    def shot(name: str) -> None:
        """Full-page screenshot of the current page into SCREENS."""
        path = SCREENS / f"{request.node.name}__{next(counter):02d}-{name}.png"
        full_shot(pg, path)
        request.node.shots.append(str(path))

    pg.shot = shot
    open_coupon_service(pg, base_url)
    yield pg

    rep = getattr(request.node, "rep_call", None)
    if rep is not None and rep.failed:
        path = SCREENS / f"{request.node.name}__FAILED.png"
        try:
            full_shot(pg, path)
            request.node.shots.append(str(path))
        except Exception as e:  # a crashed page shouldn't hide the real failure
            console.append(f"[e2e] failure screenshot not taken: {e}")
    log = SCREENS / f"{request.node.name}.console.log"
    log.write_text("\n".join(console) or "(no console output)\n", encoding="utf-8")
    request.node.console_log = str(log)
    context.close()


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_call(item):
    """Flow 10: any browser console error fails the test that caused it."""
    outcome = yield
    errors = getattr(item, "console_errors", [])
    if outcome.excinfo is None and errors:
        outcome.force_exception(AssertionError("Browser console errors:\n  " + "\n  ".join(errors)))


@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    setattr(item, f"rep_{rep.when}", rep)


@pytest.hookimpl(trylast=True)
def pytest_runtest_teardown(item):
    rep = getattr(item, "rep_call", None)
    if rep is None:
        return
    outcome = "xfail" if hasattr(rep, "wasxfail") and rep.skipped else "xpass" if hasattr(rep, "wasxfail") else rep.outcome
    message = ""
    if rep.failed:
        message = str(rep.longrepr.reprcrash.message) if hasattr(rep.longrepr, "reprcrash") else str(rep.longrepr)
    elif hasattr(rep, "wasxfail"):
        message = rep.wasxfail
    RESULTS.append({"name": item.name, "doc": (item.function.__doc__ or "").strip().splitlines()[0], "outcome": outcome, "message": message, "item": item})


def pytest_sessionfinish(session, exitstatus):
    if not RESULTS:
        return
    lines = ["# Coupon e2e report", "", f"Base URL: {BASE_URL}", "", "| Test | Result |", "|---|---|"]
    lines += [f"| {r['name']} — {r['doc']} | {r['outcome'].upper()} |" for r in RESULTS]
    for r in RESULTS:
        item = r["item"]
        lines += ["", f"## {r['name']} — {r['outcome'].upper()}", "", r["doc"]]
        if r["message"]:
            lines += ["", "```", r["message"].strip()[:2000], "```"]
        lines += ["", f"Console log: {getattr(item, 'console_log', '(none)')}"]
        lines += [f"- {s}" for s in getattr(item, "shots", [])]
    (SCREENS / "report.md").write_text("\n".join(lines) + "\n", encoding="utf-8")
