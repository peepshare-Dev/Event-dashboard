"""Shared steps for the Coupon e2e tests: sign in, navigate, wait, screenshot, keyboard focus checks."""

import re
from pathlib import Path

from playwright.sync_api import Page, expect

# Buttons that change data. BD must never see these enabled (store notes / documents are the exception).
WRITE_BUTTON = re.compile(r"^(Create|Add|Edit|Delete|Save|Remove|Change|Upload|Move|Discard)\b")


def settle(page: Page) -> None:
    """Wait for the network to go idle, then for the app's own loading states to clear.

    The mock API answers from memory after a timeout, not over the network, so networkidle alone
    doesn't mean the data is on screen.
    """
    page.wait_for_load_state("networkidle")
    page.wait_for_function(
        """() => !document.querySelector('[role=status][aria-label^="Loading"], [aria-busy="true"], .animate-pulse')""",
        timeout=15_000,
    )


def mock_api_url(page: Page) -> str:
    """URL of the mock API module the app actually loaded.

    After a hot update Vite serves it as `couponApi.ts?t=…`; importing the bare path would give
    tests a second, separate copy of the data.
    """
    return page.evaluate(
        """() => performance.getEntriesByType('resource').map((e) => e.name)
          .find((n) => /\\/src\\/data\\/mock\\/couponApi\\.ts(\\?|$)/.test(n)) || '/src/data/mock/couponApi.ts'"""
    )


def open_coupon_service(page: Page, base_url: str) -> None:
    page.goto(base_url)
    page.evaluate("localStorage.setItem('peepshare.lang', 'en')")
    page.reload()
    settle(page)
    page.get_by_placeholder("81 234 5678").fill("812345678")
    page.get_by_placeholder("Enter your password").fill("e2e-password")
    page.locator("button[type=submit]").click()
    settle(page)
    card = page.locator("div.rounded-2xl", has=page.get_by_role("heading", name="Coupon", exact=True))
    card.get_by_role("button", name="Open Service").click()
    page.get_by_role("button", name="Coupon list").first.wait_for(timeout=15_000)
    settle(page)


# Something each page only shows once its data is in, since a page can be between loading states
# with no spinner (e.g. the dashboard before its first numbers arrive).
READY = {
    "Dashboard": 'section[aria-label="Key numbers"], button:has-text("Go to Coupon list")',
    "Partners": 'table tbody tr, :text("No partners yet")',
    "Coupon list": 'table tbody tr, :text("No coupons yet")',
    "Campaigns": 'table tbody tr, :text("No campaigns yet")',
    "Display": 'ol[aria-label="Banner display order"], :text("No banners yet")',
}


def go(page: Page, menu: str) -> None:
    """Open a Coupon sub-menu from the sidebar and wait until its content is on screen."""
    page.get_by_role("navigation").get_by_role("button", name=menu, exact=True).first.click()
    settle(page)
    page.locator(READY[menu]).first.wait_for(timeout=15_000)
    settle(page)


def switch_role(page: Page, role: str) -> None:
    current = "BD" if role == "Admin" else "Admin"
    page.locator("header button", has_text=current).first.click()
    page.get_by_role("button", name=role, exact=True).click()
    settle(page)


def toast(page: Page, text: str):
    t = page.get_by_role("status").filter(has_text=text)
    t.wait_for(timeout=8_000)
    return t


def full_shot(page: Page, path: Path) -> None:
    """Screenshot the whole page layout.

    The app scrolls inside <main>, not the window, so a plain full-page screenshot stops at the
    viewport. Grow the viewport to fit <main>'s content, shoot, then put it back.
    """
    viewport = page.viewport_size
    height = page.evaluate(
        """() => {
          const m = document.querySelector('main');
          return m ? Math.ceil(m.getBoundingClientRect().top + m.scrollHeight) : document.documentElement.scrollHeight;
        }"""
    )
    page.set_viewport_size({"width": viewport["width"], "height": min(max(height, viewport["height"]), 12_000)})
    page.wait_for_timeout(200)
    page.screenshot(path=str(path), full_page=True)
    page.set_viewport_size(viewport)
    page.wait_for_timeout(100)


def visible_write_buttons(page: Page, scope=None) -> list[str]:
    """Names of enabled, visible buttons that would change data."""
    root = scope or page
    names = []
    for b in root.get_by_role("button", name=WRITE_BUTTON).all():
        if b.is_visible() and b.is_enabled():
            names.append(b.get_attribute("aria-label") or b.inner_text().strip())
    return names


# --- Keyboard ---

_SNAPSHOT_JS = """(el) => {
  // Focus styles may sit on the element or a wrapper (focus-within), so read a few ancestors too.
  const parts = [];
  for (let n = el, i = 0; n && n !== document.body && i < 4; n = n.parentElement, i++) {
    const s = getComputedStyle(n);
    parts.push([s.outlineStyle, s.outlineWidth, s.outlineColor, s.boxShadow, s.backgroundColor, s.borderColor, s.textDecorationLine, s.color].join('|'));
  }
  return parts.join('#');
}"""

_DESCRIBE_JS = """(el) => {
  const name = el.getAttribute('aria-label') || el.getAttribute('placeholder') || (el.innerText || '').trim().split('\\n')[0] || el.getAttribute('type') || '';
  return `<${el.tagName.toLowerCase()}> ${name.slice(0, 60)}`;
}"""


class Keyboard:
    """Moves focus with Tab only, and records every stop whose focus isn't visible.

    "Visible" means the element (or a wrapper) looks different while focused than after focus
    leaves it: an outline, ring, background, border, underline or text colour change.
    """

    def __init__(self, page: Page):
        self.page = page
        self.invisible: list[str] = []
        self._current = None  # (handle, focused snapshot, description)

    def _record_current(self) -> None:
        handle = self.page.evaluate_handle("document.activeElement")
        if self.page.evaluate("(el) => el === document.body", handle):
            self._current = None
            return
        self.page.wait_for_timeout(180)  # let colour transitions finish
        self._current = (handle, self.page.evaluate(_SNAPSHOT_JS, handle), self.page.evaluate(_DESCRIBE_JS, handle))

    def _check_left(self) -> None:
        if not self._current:
            return
        handle, focused, desc = self._current
        if not self.page.evaluate("(el) => el.isConnected", handle):
            return
        self.page.wait_for_timeout(180)
        if self.page.evaluate(_SNAPSHOT_JS, handle) == focused and desc not in self.invisible:
            self.invisible.append(desc)

    def tab(self, shift: bool = False) -> None:
        self.page.keyboard.press("Shift+Tab" if shift else "Tab")
        self._check_left()
        self._record_current()

    def tab_to(self, matches: str, max_steps: int = 80) -> None:
        """Press Tab until the focused element matches a JS predicate over `el`, e.g. "el.placeholder === 'x'"."""
        for _ in range(max_steps):
            self.tab()
            if self.page.evaluate(f"() => {{ const el = document.activeElement; return Boolean({matches}); }}"):
                return
        raise AssertionError(f"Tab never reached an element matching: {matches}")

    def press(self, key: str) -> None:
        self.page.keyboard.press(key)

    def type(self, text: str) -> None:
        self.page.keyboard.type(text)

    def leave(self) -> None:
        """Check the focused element's focus style before acting on it: Tab away, then Shift+Tab back."""
        self.tab()
        self.tab(shift=True)


def name_is(name: str) -> str:
    """Predicate for Keyboard.tab_to: accessible name, visible text or placeholder equals `name`."""
    n = name.replace("'", "\\'")
    return f"(el.getAttribute('aria-label') || el.getAttribute('placeholder') || (el.innerText || '').trim()) === '{n}'"


def expect_no_invisible_focus(kb: Keyboard) -> None:
    assert not kb.invisible, "Focus isn't visible on: " + "; ".join(kb.invisible)


__all__ = [
    "Keyboard",
    "expect",
    "expect_no_invisible_focus",
    "full_shot",
    "go",
    "mock_api_url",
    "name_is",
    "open_coupon_service",
    "settle",
    "switch_role",
    "toast",
    "visible_write_buttons",
]
