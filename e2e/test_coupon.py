"""End-to-end tests for the Coupon service (mock API, so every test starts from the same seed data).

Each test gets a fresh browser context, so data created in one test never leaks into another.
Console errors fail the test that produced them (see conftest.py).
"""

import re
from datetime import date, timedelta

import pytest

from helpers import Keyboard, expect, expect_no_invisible_focus, go, mock_api_url, name_is, settle, switch_role, toast, visible_write_buttons

IN_20_DAYS = date.today() + timedelta(days=20)  # inside Phase 2, which runs to today + 40 days


# --- Small page helpers ---

def row(page, title):
    return page.locator("table tbody tr", has_text=title)


def banner_titles(page):
    return [t.strip() for t in page.locator('ol[aria-label="Banner display order"] > li p.font-semibold').all_inner_texts()]


def open_logo_order(page):
    go(page, "Partners")
    page.get_by_role("tab", name="Logo order").click()


def logo_tile(page, brand):
    return page.locator('ol[aria-label="Partner logo order"] > li', has_text=brand)


def kpi(page, label):
    return page.locator('section[aria-label="Key numbers"] > div > div', has_text=label).locator("p").nth(1).inner_text()


def number(text):
    return int(re.sub(r"[^\d]", "", text) or 0)


def start_coupon(page, files, title):
    """Coupon list → Create coupon, with title, Swensen's, image and expiry filled in (no campaign: that's added later)."""
    go(page, "Coupon list")
    page.get_by_role("button", name="Create coupon").click()
    settle(page)
    page.get_by_placeholder("e.g. ลด 100.-").fill(title)
    page.get_by_placeholder("Search partner...").fill("Swen")
    page.get_by_role("option", name="Swensen's").click()
    page.locator('fieldset:has(> legend:has-text("Coupon image")) input[type=file]').set_input_files(files["square"])
    expect(page.locator('fieldset:has(> legend:has-text("Coupon image"))').get_by_role("button", name="Replace")).to_be_visible(timeout=8_000)
    page.locator("#coupon-quantity input[type=date]").fill(IN_20_DAYS.isoformat())
    page.locator("#coupon-quantity input[type=time]").fill("20:00")


# --- 1 ---

def test_01_phase_dates_are_validated(page):
    """Campaigns: overlapping dates show a warning naming the campaign; an end date before the start blocks saving; then the "Add coupons" shortcut."""
    go(page, "Campaigns")
    page.shot("campaigns")
    page.get_by_role("button", name="Create campaign").first.click()
    drawer = page.locator("main")  # the form is its own page
    drawer.get_by_label("Campaign name").fill("E2E overlapping campaign")
    dates = drawer.locator("input[type=date]")
    dates.nth(0).fill(date.today().isoformat())  # inside Phase 2
    dates.nth(1).fill((date.today() + timedelta(days=10)).isoformat())
    expect(drawer.get_by_text("11 days")).to_be_visible()  # live duration, both days counted
    warning = drawer.get_by_text(re.compile("overlap", re.I)).locator("xpath=..")
    expect(warning).to_contain_text("Campaign 2 · Year-End Feast")
    page.shot("phase-overlap-warning")

    dates.nth(1).fill((date.today() - timedelta(days=5)).isoformat())
    drawer.get_by_role("button", name="Save campaign").click()
    expect(drawer.get_by_text("The end date must be after the start date.")).to_be_visible()
    expect(page.get_by_role("heading", name="Create campaign")).to_be_visible()  # not saved
    page.shot("phase-end-before-start")

    # Overlap only warns: saving still works, then the shortcut picks existing coupons (not in a phase yet) to add.
    dates.nth(1).fill((date.today() + timedelta(days=10)).isoformat())
    drawer.get_by_role("button", name="Save campaign").click()
    toast(page, "Campaign created.")
    expect(page.get_by_role("heading", name="E2E overlapping campaign")).to_be_visible()
    expect(page.get_by_text("Draft", exact=True).first).to_be_visible()  # no coupons yet
    page.shot("phase-created")
    page.get_by_role("button", name="Add coupons to this campaign").first.click()
    picker = page.get_by_role("dialog", name="Coupons in E2E overlapping campaign")
    # Every coupon is listed; ones in another campaign can't be added.
    expect(picker.get_by_role("button", name=re.compile("^Add .* to this campaign$"))).to_have_count(14)
    expect(picker.get_by_role("button", name="Add ลด 50% พิซซ่าถาดใหญ่ to this campaign")).to_be_disabled()
    picker.get_by_role("button", name="Add ลด 100 บาท พิซซ่าถาดใหญ่ to this campaign").click()
    page.shot("campaign-coupon-dialog")
    picker.get_by_role("button", name="Save coupons").click()
    toast(page, "Coupons in E2E overlapping campaign saved.")
    expect(row(page, "ลด 100 บาท พิซซ่าถาดใหญ่")).to_be_visible()
    expect(page.get_by_text("Draft", exact=True)).to_have_count(0)  # has a coupon now
    page.shot("phase-coupon-added")

    # Taking it out again keeps the coupon, back out of any phase.
    page.get_by_role("button", name="Remove ลด 100 บาท พิซซ่าถาดใหญ่ from this campaign").click()
    page.get_by_role("button", name="Remove", exact=True).click()
    toast(page, "“ลด 100 บาท พิซซ่าถาดใหญ่” removed from E2E overlapping campaign.")
    go(page, "Coupon list")
    expect(row(page, "ลด 100 บาท พิซซ่าถาดใหญ่")).to_contain_text("Not in a campaign")


def test_01b_phase_list_detail_and_delete_rules(page):
    """Campaigns list sorts newest first and filters by derived status; a campaign with claims can't be deleted (and says why); an empty one can."""
    go(page, "Campaigns")
    names = [n.strip() for n in page.locator("table tbody tr td:first-child").all_inner_texts()]
    assert names == ["Campaign 4 · Mid-Year (draft)", "Campaign 3 · Songkran 2027", "Campaign 2 · Year-End Feast", "Campaign 1 · Back to School"], names
    statuses = [r.locator("td").last.inner_text().strip() for r in page.locator("table tbody tr").all()]
    assert statuses == ["Draft", "Draft", "Active", "Ended"], statuses  # 3 and 4 have no coupons yet
    expect(row(page, "Campaign 2 · Year-End Feast")).to_contain_text("61 days")
    page.get_by_role("tab", name=re.compile(r"^Draft")).click()
    expect(page.locator("table tbody tr")).to_have_count(2)
    page.get_by_role("tab", name=re.compile(r"^All")).click()

    page.get_by_role("button", name="Campaign 2 · Year-End Feast").click()
    expect(page.get_by_role("heading", name="Campaign 2 · Year-End Feast")).to_be_visible()
    summary = page.locator('section[aria-label="Campaign summary"]')
    expect(summary).to_contain_text("Partners")
    groups = page.locator('th[scope="rowgroup"]')
    expect(groups).to_have_count(5)  # one per brand
    delete = page.get_by_role("button", name="Delete")
    expect(delete).to_be_disabled()
    why = page.locator(f"#{delete.get_attribute('aria-describedby')}")
    expect(why).to_contain_text("users have claimed")
    page.shot("phase-detail-claimed")

    page.get_by_role("button", name="Back to Campaigns").click()
    page.get_by_role("button", name="Campaign 4 · Mid-Year (draft)").click()
    expect(page.get_by_text("No coupons in this campaign yet")).to_be_visible()
    page.get_by_role("button", name="Delete").click()
    page.get_by_label("Delete campaign?").get_by_role("button", name="Delete").click()
    toast(page, "Campaign deleted.")
    expect(page.locator("table tbody tr")).to_have_count(3)


def test_01c_phase_errors_are_explained(page):
    """When loading or deleting fails, the Campaigns page says so and offers a way forward."""
    # Break the mock API in place (the page uses the same module instance).
    api = mock_api_url(page)
    page.evaluate(
        """async (api) => {
          const { couponApi } = await import(api);
          window.__realList = couponApi.phases.list;
          couponApi.phases.list = () => Promise.reject(new Error('e2e: offline'));
        }""",
        api,
    )
    page.get_by_role("navigation").get_by_role("button", name="Campaigns", exact=True).first.click()
    expect(page.get_by_text("Couldn’t load campaigns")).to_be_visible(timeout=8_000)
    page.shot("phases-load-error")
    page.evaluate("async (api) => { const { couponApi } = await import(api); couponApi.phases.list = window.__realList; }", api)
    page.get_by_role("button", name="Retry").click()
    expect(page.locator("table tbody tr")).to_have_count(4, timeout=8_000)

    page.evaluate(
        """async (api) => {
          const { couponApi } = await import(api);
          couponApi.phases.remove = () => Promise.reject(new Error('e2e: offline'));
        }""",
        api,
    )
    page.get_by_role("button", name="Campaign 4 · Mid-Year (draft)").click()
    page.get_by_role("button", name="Delete").click()
    page.get_by_label("Delete campaign?").get_by_role("button", name="Delete").click()
    expect(page.get_by_role("alert")).to_contain_text("Couldn’t delete the campaign.")
    expect(page.get_by_role("heading", name="Campaign 4 · Mid-Year (draft)")).to_be_visible()  # still here


def test_01b_create_campaign_with_coupon_quantities(page):
    """Create a campaign on its own page, picking a coupon from the coupon list with how many users can claim (ice cream: 100); then change it."""
    go(page, "Campaigns")
    page.get_by_role("button", name="Create campaign").first.click()
    form = page.locator("main")
    form.get_by_label("Campaign name").fill("E2E ice cream week")
    dates = form.locator("input[type=date]")
    dates.nth(0).fill((date.today() + timedelta(days=150)).isoformat())
    dates.nth(1).fill((date.today() + timedelta(days=160)).isoformat())

    # Coupons are picked in a modal. The scoop coupon expires before this campaign starts, so it can't be added.
    page.get_by_role("button", name="Add coupons").click()
    picker = page.get_by_role("dialog", name="Coupons in E2E ice cream week")
    scoop = picker.get_by_role("button", name="Add ไอศกรีม 1 สกู๊ป ฟรี to this campaign")
    expect(scoop).to_be_disabled()
    picker.get_by_role("button", name="Cancel").click()
    dates.nth(0).fill((date.today() + timedelta(days=10)).isoformat())
    dates.nth(1).fill((date.today() + timedelta(days=40)).isoformat())
    page.get_by_role("button", name="Add coupons").click()
    scoop.click()
    in_modal = picker.get_by_label("Usable in this campaign")
    expect(in_modal).to_have_value("200")  # defaults to the whole quantity
    in_modal.fill("300")
    picker.get_by_role("button", name="Done").click()
    expect(picker.get_by_text("Enter a whole number from 1 to 200.")).to_be_visible()
    in_modal.fill("100")
    page.shot("campaign-coupon-picker")
    picker.get_by_role("button", name="Done").click()
    expect(picker).to_have_count(0)

    picked = page.locator("#phase-coupons")
    expect(picked).to_contain_text("ไอศกรีม 1 สกู๊ป ฟรี")
    qty = picked.get_by_label("Usable in this campaign")
    expect(qty).to_have_value("100")
    qty.fill("300")
    page.get_by_role("button", name="Save campaign").click()
    expect(picked.get_by_text("Enter a whole number from 1 to 200.")).to_be_visible()
    expect(page.get_by_text("Fix the quantities marked below.")).to_be_visible()
    qty.fill("100")
    expect(page.get_by_text("1 coupon · 100 usable").first).to_be_visible()
    page.shot("campaign-form-page")
    page.get_by_role("button", name="Save campaign").click()

    toast(page, "Campaign created with 1 coupon.")
    expect(page.get_by_role("heading", name="E2E ice cream week")).to_be_visible()
    expect(row(page, "ไอศกรีม 1 สกู๊ป ฟรี")).to_contain_text("0 / 100")
    page.shot("campaign-coupon-quantity")

    # On by default, it waits for the campaign: Scheduled now, Active once the start date comes.
    expect(row(page, "ไอศกรีม 1 สกู๊ป ฟรี")).to_contain_text("Scheduled")
    go(page, "Coupon list")
    expect(row(page, "ไอศกรีม 1 สกู๊ป ฟรี")).to_contain_text("Scheduled")
    go(page, "Campaigns")
    page.get_by_role("button", name="E2E ice cream week").click()

    # Quick change on the campaign page.
    page.get_by_role("button", name="Change how many of ไอศกรีม 1 สกู๊ป ฟรี can be claimed").click()
    dialog = page.get_by_role("dialog", name="Usable in E2E ice cream week")
    dialog.get_by_label("Usable in this campaign").fill("150")
    dialog.get_by_role("button", name="Save quantity").click()
    toast(page, "“ไอศกรีม 1 สกู๊ป ฟรี”: 150 usable in E2E ice cream week.")
    expect(row(page, "ไอศกรีม 1 สกู๊ป ฟรี")).to_contain_text("0 / 150")

    # Taken out on the edit page, it's back out of any campaign.
    page.get_by_role("button", name="Edit", exact=True).click()
    page.get_by_role("button", name="Remove ไอศกรีม 1 สกู๊ป ฟรี from this campaign").click()
    expect(picked.get_by_text("No coupons in this campaign yet")).to_be_visible()
    page.get_by_role("button", name="Save changes").click()
    toast(page, "Campaign saved.")
    expect(page.get_by_text("No coupons in this campaign yet")).to_be_visible()

# --- 2 ---

def test_02_single_barcode_coupon_toggle_and_undo(page, files):
    """Create a coupon with one barcode → it's in the Coupon list → turn it off → Undo turns it back on."""
    start_coupon(page, files, "E2E single barcode")
    page.get_by_placeholder("e.g. PIZZA50OFF").fill("E2E-SINGLE-01")
    expect(page.locator('#coupon-code svg[aria-label="Barcode for E2E-SINGLE-01"] rect').first).to_be_attached()
    page.get_by_placeholder("e.g. 500").fill("150")
    page.shot("create-coupon-single")
    page.get_by_role("button", name="Create coupon").click()
    toast(page, "Coupon created. Add it to a campaign on the Campaigns page to show it in the app.")
    settle(page)
    page.shot("coupon-list")
    expect(row(page, "E2E single barcode")).to_contain_text("Not in a campaign")

    switch = row(page, "E2E single barcode").get_by_role("switch")
    expect(switch).to_have_attribute("aria-checked", "true")
    switch.click()
    expect(switch).to_have_attribute("aria-checked", "false")
    toast(page, "Coupon turned off").get_by_role("button", name="Undo").click()
    toast(page, "Change undone.")
    expect(switch).to_have_attribute("aria-checked", "true")

    # Created first, then added to a phase on the Phases page.
    go(page, "Campaigns")
    page.get_by_role("button", name="Campaign 2 · Year-End Feast").click()
    page.get_by_role("button", name="Add coupons", exact=True).click()
    picker = page.get_by_role("dialog")
    picker.get_by_placeholder("Search title or partner").fill("E2E")
    picker.get_by_role("button", name="Add E2E single barcode to this campaign").click()
    picker.get_by_role("button", name="Save coupons").click()
    toast(page, "Coupons in Campaign 2 · Year-End Feast saved.")
    expect(row(page, "E2E single barcode")).to_be_visible()
    go(page, "Coupon list")
    expect(row(page, "E2E single barcode")).to_contain_text("Campaign 2 · Year-End Feast")
    expect(row(page, "E2E single barcode")).to_contain_text("Active")  # on by default, and its campaign is running


# --- 3 ---

def test_03_unique_codes_from_csv(page, files):
    """Create a coupon with unique codes from a CSV → quantity locks to the code count → duplicates are reported."""
    start_coupon(page, files, "E2E unique codes")
    page.get_by_text("Unique code per coupon").click()
    page.locator("#coupon-code").get_by_text("Upload CSV", exact=True).click()
    page.locator("#coupon-code input[type=file]").set_input_files(files["codes"])
    expect(page.get_by_text("4 codes ready")).to_be_visible()

    duplicates = page.get_by_text(re.compile(r"2 duplicate codes found"))
    expect(duplicates).to_be_visible()
    expect(page.locator("#coupon-code span.font-mono", has_text="E2E-0001, E2E-0002")).to_be_visible()

    quantity = page.locator("#coupon-quantity input").first
    expect(quantity).to_have_value("4")
    expect(quantity).to_have_attribute("readonly", "")
    page.shot("create-coupon-unique")

    page.get_by_role("button", name="Create coupon").click()
    toast(page, "Coupon created. Add it to a campaign on the Campaigns page to show it in the app.")
    expect(row(page, "E2E unique codes").get_by_text("/ 4")).to_be_visible()


def test_03b_generate_codes(page, files):
    """Code section: Generate fills a single barcode; unique codes can be generated (with a prefix) instead of uploaded, and the quantity follows."""
    start_coupon(page, files, "E2E generated codes")
    code = page.locator("#coupon-code")
    code.get_by_role("button", name="Generate", exact=True).click()
    barcode = page.get_by_placeholder("e.g. PIZZA50OFF").input_value()
    assert re.fullmatch(r"[A-Z0-9]{10}", barcode), barcode

    page.get_by_text("Unique code per coupon").click()
    code.get_by_role("button", name="Generate", exact=True).click()
    expect(code.get_by_text("Enter a whole number from 1 to 100,000.")).to_be_visible()
    code.get_by_label("Prefix (optional)").fill("e2e-x")
    expect(code.get_by_label("Prefix (optional)")).to_have_value("E2EX")
    code.get_by_label("Number of codes").fill("25")
    code.get_by_role("button", name="Generate", exact=True).click()
    expect(code.get_by_text("25 codes ready")).to_be_visible()
    expect(page.locator('#coupon-code svg[aria-label^="Barcode for E2EX-"]')).to_be_attached()
    quantity = page.locator("#coupon-quantity input").first
    expect(quantity).to_have_value("25")
    expect(quantity).to_have_attribute("readonly", "")
    with page.expect_download() as dl:
        code.get_by_role("button", name="Download CSV").click()
    lines = open(dl.value.path(), encoding="utf-8-sig", newline="").read().split("\r\n")
    assert lines[0] == '"code"' and len(lines) == 26 and all(re.fullmatch(r'"E2EX-[A-Z0-9]{8}"', l) for l in lines[1:]), lines[:3]
    page.shot("create-coupon-generated")

    page.get_by_role("button", name="Create coupon").click()
    toast(page, "Coupon created. Add it to a campaign on the Campaigns page to show it in the app.")
    expect(row(page, "E2E generated codes").get_by_text("/ 25")).to_be_visible()


# --- 4 ---

def test_04_expired_coupon_cannot_be_activated(page):
    """An expired coupon can be turned off but not back on; the switch explains why."""
    go(page, "Coupon list")
    page.get_by_placeholder("Search title or partner").fill("Flash")
    r = row(page, "Flash")
    expect(r.get_by_text("Expired")).to_be_visible()
    switch = r.get_by_role("switch")
    switch.click()  # it's still on, and turning off is allowed
    expect(toast(page, "can’t be turned back on").get_by_role("button", name="Undo")).to_have_count(0)

    expect(switch).to_be_disabled()
    tooltip = r.locator("span[title]").first.get_attribute("title") or ""
    assert tooltip.startswith("Expired on ") and "Set a later expiry date" in tooltip, tooltip
    reason_id = switch.get_attribute("aria-describedby")
    described = page.locator(f'[id="{reason_id}"]')
    assert described.count() == 1, f'id "{reason_id}" is used {described.count()} times in the page, so aria-describedby is ambiguous'
    expect(described).to_have_text(tooltip)  # same explanation for screen readers
    switch.click(force=True)
    expect(switch).to_have_attribute("aria-checked", "false")
    page.shot("expired-coupon-disabled")

    # Its form says it's turned off and expired, and it can still be edited.
    r.get_by_role("button", name=re.compile("Flash")).click()
    settle(page)
    expect(page.get_by_text("Turned off, so it doesn’t show in the app", exact=False)).to_be_visible()
    expect(page.get_by_text("This time has passed, so the coupon will show as Expired.")).to_be_visible()
    page.shot("expired-coupon-form")
    page.get_by_role("button", name="Save changes").click()
    toast(page, "Coupon saved.")


# --- 5 ---

def _move_dairy_queen_up_and_save(page):
    go(page, "Display")
    before = banner_titles(page)
    page.get_by_role("button", name="Move Dairy Queen Blizzard 1 แถม 1 up").click()
    expect(page.get_by_text("Unsaved order — the app still uses the saved order.")).to_be_visible()
    page.get_by_role("button", name="Save order").click()
    toast(page, "Banner order saved.")
    after = banner_titles(page)
    assert after.index("Dairy Queen Blizzard 1 แถม 1") == before.index("Dairy Queen Blizzard 1 แถม 1") - 1, after
    return after


def test_05_banner_order_persists(page):
    """Reorder banners with the up/down buttons → Save order → reopen the page → the saved order comes back from the API."""
    saved = _move_dairy_queen_up_and_save(page)
    page.shot("display-saved-order")
    go(page, "Dashboard")
    go(page, "Display")  # re-mounts the page and fetches the banners again
    assert banner_titles(page) == saved
    expect(page.locator('[aria-label="Banner carousel"] img').nth(1)).to_have_attribute("alt", "Dairy Queen Blizzard 1 แถม 1")
    page.shot("display-after-reopen")


@pytest.mark.xfail(strict=True, reason="The mock API keeps data in memory, so a full browser reload resets it to the seed. Should pass once the real backend is wired in.")
def test_05b_banner_order_survives_browser_reload(page, base_url):
    """Reorder banners → save → full browser reload → order persists."""
    from helpers import open_coupon_service

    saved = _move_dairy_queen_up_and_save(page)
    page.reload()
    open_coupon_service(page, base_url)
    go(page, "Display")
    assert banner_titles(page) == saved


# --- 6 ---

def test_06_partner_logo_auto_hidden_when_coupon_expired(page):
    """Partners > Logo order: a partner whose coupons expired, or whose contract ended, shows "Auto-hidden" with the reason; tiles link to the partner page instead of a switch."""
    open_logo_order(page)
    # Bonchon's only switched-on coupon has expired; Bar B Q Plaza's contract ended (its switch is still on).
    for brand, reason in [("Bonchon", "All coupons expired"), ("Bar B Q Plaza", "Contract ended")]:
        tile = logo_tile(page, brand)
        expect(tile.get_by_text("Auto-hidden", exact=True)).to_be_visible()
        expect(tile.get_by_text(reason, exact=True)).to_be_visible()
    expect(page.locator('ol[aria-label="Partner logo order"]').get_by_role("switch")).to_have_count(0)  # no visibility switch here
    strip = page.locator("section", has=page.locator("#partner-strip-title"))
    expect(strip.get_by_text("Bonchon")).to_have_count(0)
    expect(strip.get_by_text("Bar B Q Plaza")).to_have_count(0)
    page.shot("partner-logos")
    logo_tile(page, "Bonchon").get_by_role("button", name="Open Bonchon in Partners").click()
    settle(page)
    expect(page.get_by_role("heading", name="Bonchon")).to_be_visible()


# --- 7 ---

def test_07_dashboard_kpis_match_mock_data(page):
    """Dashboard KPIs equal totals computed straight from the mock data, and claimed + remaining = total."""
    go(page, "Dashboard")
    page.shot("dashboard")
    start, end = page.locator("input[type=date]").nth(0).input_value(), page.locator("input[type=date]").nth(1).input_value()
    expected = page.evaluate(
        """async ([api, start, end]) => {
          const { couponApi } = await import(api);
          const now = new Date().toISOString();
          const phase = (await couponApi.phases.list()).find((p) => p.status === 'active' && p.startDate <= now && now <= p.endDate);
          const coupons = (await couponApi.coupons.list({ phaseId: phase.id }));
          const from = new Date(`${start}T00:00:00`).toISOString(), to = new Date(`${end}T23:59:59.999`).toISOString();
          const rows = await couponApi.redemptions.list({ from, to, phaseId: phase.id });
          const inRange = (iso) => Boolean(iso && from <= iso && iso <= to);
          return {
            total: coupons.reduce((s, c) => s + c.totalQuantity, 0),
            claimedAllTime: coupons.reduce((s, c) => s + c.claimedCount, 0),
            remaining: coupons.reduce((s, c) => s + Math.max(0, c.totalQuantity - c.claimedCount), 0),
            claimed: rows.filter((r) => inRange(r.claimedAt)).length,
            redeemed: rows.filter((r) => inRange(r.redeemedAt)).length,
          };
        }""",
        [mock_api_url(page), start, end],
    )
    shown = {k: number(kpi(page, label)) for k, label in [("total", "Total coupons in campaign"), ("claimed", "Claimed"), ("redeemed", "Redeemed"), ("remaining", "Remaining")]}
    assert shown == {k: expected[k] for k in shown}, f"tiles {shown} vs mock {expected}"
    # The default range covers the phase so far, so every claim is in it.
    assert expected["claimed"] == expected["claimedAllTime"], expected
    assert shown["claimed"] + shown["remaining"] == shown["total"], shown
    assert shown["redeemed"] <= shown["claimed"], shown

    # The per-coupon table adds up to the same totals.
    table = page.locator("section", has=page.get_by_role("heading", name="Coupon performance")).locator("tbody tr")
    sums = [sum(number(table.nth(i).locator("td").nth(c).inner_text()) for i in range(table.count())) for c in (2, 3)]
    assert sums == [shown["claimed"], shown["redeemed"]], sums


# --- 11 ---

def partner_preview(page):
    """Partner names in Partners > Logo order's "Partner with PEEPS" preview strip, in order."""
    open_logo_order(page)
    strip = page.locator("section", has=page.locator("#partner-strip-title"))
    return [n.strip() for n in strip.locator("ul li span").all_inner_texts()]


def test_11_contract_ended_brand_hidden_from_partner_preview(page):
    """A partner whose partnerEndDate has passed shows "Contract ended" and its logo is left out of the partner logo preview, even with the partner switch on."""
    # Seed: Bar B Q Plaza's contract ended 10 days ago; its switch is still on.
    go(page, "Partners")
    expect(row(page, "Bar B Q Plaza")).to_contain_text("Contract ended")
    page.get_by_role("button", name="Bar B Q Plaza").click()
    settle(page)
    expect(page.locator("header").get_by_text("Contract ended", exact=True)).to_be_visible()
    expect(page.get_by_role("switch")).to_have_attribute("aria-checked", "true")
    expect(page.get_by_text("The logo is hidden: contract ended.")).to_be_visible()
    preview = partner_preview(page)
    assert "Bar B Q Plaza" not in preview, preview
    expect(logo_tile(page, "Bar B Q Plaza").get_by_text("Contract ended", exact=True)).to_be_visible()

    # A visible brand whose contract end moves into the past drops out of the preview.
    assert "The Pizza Company" in preview, preview
    go(page, "Partners")
    page.get_by_role("button", name="The Pizza Company").click()
    settle(page)
    page.locator("fieldset input[type=date]").nth(1).fill((date.today() - timedelta(days=1)).isoformat())
    page.get_by_role("button", name="Save changes").click()
    toast(page, "Partner saved.")
    expect(page.locator("header").get_by_text("Contract ended", exact=True)).to_be_visible()
    expect(page.get_by_text("The logo is hidden: contract ended.")).to_be_visible()
    page.shot("brand-contract-ended")
    preview = partner_preview(page)
    assert "The Pizza Company" not in preview, preview
    expect(logo_tile(page, "The Pizza Company").get_by_text("Auto-hidden", exact=True)).to_be_visible()
    expect(logo_tile(page, "The Pizza Company").get_by_text("Contract ended", exact=True)).to_be_visible()
    page.shot("partner-preview-without-ended-brands")


# --- 12 ---

def test_12_create_coupon_from_brand_preselects_brand_and_prefills_conditions(page, files):
    """"Create coupon" on a partner's Coupons tab opens the form with that partner selected and its default conditions filled in (still editable); the saved coupon shows on the partner."""
    go(page, "Partners")
    page.get_by_role("button", name="Dairy Queen").click()
    page.get_by_role("tab", name=re.compile(r"^Coupons")).click()
    page.get_by_role("button", name="Create coupon").click()
    settle(page)
    expect(page.get_by_role("heading", name="Create coupon")).to_be_visible()

    # Brand pre-selected: shown as the chosen card, not an empty search box.
    details = page.locator("#coupon-details")
    expect(details.get_by_text("Dairy Queen", exact=True)).to_be_visible()
    expect(details.get_by_role("button", name="Change")).to_be_visible()
    expect(page.get_by_placeholder("Search partner...")).to_have_count(0)
    expect(page.locator("#coupon-preview")).to_contain_text("Dairy Queen")

    # Default conditions filled in, and still editable.
    conditions = page.get_by_role("textbox", name="Conditions")
    expect(conditions).to_contain_text("เฉพาะขนาด Small และ Medium")
    expect(conditions).to_contain_text("ใช้ได้ที่ร้าน Dairy Queen ทุกสาขา")
    expect(page.get_by_text("Filled in from Dairy Queen’s default conditions", exact=False)).to_be_visible()
    expect(page.locator("#coupon-preview")).to_contain_text("เฉพาะขนาด Small และ Medium")
    conditions.click()
    page.keyboard.press("Control+End")
    page.keyboard.type("E2E: weekdays only.")
    expect(conditions).to_contain_text("E2E: weekdays only.")
    page.shot("coupon-from-brand")

    # Finish and save; it belongs to the brand, with the edited conditions.
    page.get_by_placeholder("e.g. ลด 100.-").fill("E2E DQ coupon")
    page.locator('fieldset:has(> legend:has-text("Coupon image")) input[type=file]').set_input_files(files["square"])
    expect(page.locator('fieldset:has(> legend:has-text("Coupon image"))').get_by_role("button", name="Replace")).to_be_visible(timeout=8_000)
    page.get_by_placeholder("e.g. PIZZA50OFF").fill("DQ-E2E-01")
    page.get_by_placeholder("e.g. 500").fill("100")
    page.locator("#coupon-quantity input[type=date]").fill(IN_20_DAYS.isoformat())
    page.locator("#coupon-quantity input[type=time]").fill("20:00")
    page.get_by_role("button", name="Create coupon").click()
    toast(page, "Coupon created. Add it to a campaign on the Campaigns page to show it in the app.")

    go(page, "Partners")
    page.get_by_role("button", name="Dairy Queen").click()
    page.get_by_role("tab", name=re.compile(r"^Coupons")).click()
    unphased = page.locator("tbody", has=page.locator('th[scope="rowgroup"]', has_text="Not in a campaign"))
    expect(unphased).to_contain_text("E2E DQ coupon")
    unphased.get_by_role("button", name="E2E DQ coupon").click()
    settle(page)
    saved = page.get_by_role("textbox", name="Conditions")
    expect(saved).to_contain_text("เฉพาะขนาด Small และ Medium")
    expect(saved).to_contain_text("E2E: weekdays only.")


# --- More Brands ---

def test_13_partners_menu_list_and_filters(page):
    """Partners sits between Dashboard and Coupon list; the list shows partner status (incl. Contract ended) and filters by status, campaign, owner and name."""
    menu = [b.strip() for b in page.get_by_role("navigation").first.locator("ul button").all_inner_texts()]
    assert menu == ["Dashboard", "Partners", "Coupon list", "Campaigns", "Display"], menu
    go(page, "Partners")
    page.shot("brands")
    rows = page.locator("table tbody tr")
    expect(rows).to_have_count(6)
    expect(row(page, "Bar B Q Plaza")).to_contain_text("Contract ended")  # switch on, end date passed
    expect(row(page, "After You")).to_contain_text("Inactive")
    expect(row(page, "The Pizza Company")).to_contain_text("Nattapong K.")

    def pick(label, option):
        page.get_by_role("button", name=f"{label} :").click()
        page.get_by_role("listbox", name=label).get_by_text(option, exact=True).click()

    pick("Partner status", "Contract ended")
    expect(rows).to_have_count(1)
    page.get_by_role("button", name="Clear all").click()
    pick("Owner BD", "Ploy W.")
    expect(rows).to_have_count(3)
    page.get_by_role("button", name="Clear all").click()
    pick("Campaign", "Campaign 1 · Back to School")
    expect(rows).to_have_count(4)
    page.get_by_role("button", name="Clear all").click()
    page.get_by_placeholder("Search partner name").fill("dairy")
    expect(rows).to_have_count(1)


def test_13b_partner_exports(page):
    """Partners: export one row per partner from the list, and one row per coupon (with views and viewers) from a partner page."""
    go(page, "Partners")
    with page.expect_download() as dl:
        page.get_by_role("button", name="Export CSV").click()
    lines = open(dl.value.path(), encoding="utf-8-sig", newline="").read().split("\r\n")
    assert lines[0].startswith('"Partner","Partner status"') and '"Unique viewers"' in lines[0], lines[0]
    assert len(lines) == 7, len(lines)  # header + 6 partners

    page.get_by_role("button", name="The Pizza Company").click()
    settle(page)
    with page.expect_download() as dl:
        page.get_by_role("button", name="Export partner data").click()
    assert dl.value.suggested_filename.startswith("partner_the-pizza-company_"), dl.value.suggested_filename
    lines = open(dl.value.path(), encoding="utf-8-sig", newline="").read().split("\r\n")
    assert len(lines) == 1 + 4, lines  # header + Pizza's 4 coupons
    assert any('"Not in a campaign"' in l for l in lines[1:]), lines


def test_13d_partner_usage_data(page):
    """Partner page > Usage data: totals, the view → claim → redeem funnel, claims chart, and numbers per campaign and per coupon; picking a campaign scopes them."""
    go(page, "Partners")
    page.get_by_role("button", name="The Pizza Company").click()
    page.get_by_role("tab", name="Usage data").click()
    settle(page)
    expect(page.get_by_role("heading", name="Coupon usage")).to_be_visible()
    by_campaign = page.locator("section", has=page.get_by_role("heading", name="By campaign"))
    names = [n.strip() for n in by_campaign.locator("tbody td:first-child button").all_inner_texts()]
    assert names == ["Campaign 2 · Year-End Feast", "Campaign 1 · Back to School", "Not in a campaign"], names
    by_coupon = page.locator("section", has=page.get_by_role("heading", name="By coupon"))
    expect(by_coupon.locator("tbody tr")).to_have_count(4)
    claimed_all = number(page.locator("dl dd").nth(2).inner_text())

    by_campaign.get_by_role("button", name="Campaign 1 · Back to School").click()
    expect(by_coupon.locator("tbody tr")).to_have_count(1)
    expect(page.get_by_text("Campaign 1 · Back to School:", exact=False)).to_be_visible()
    assert 0 < number(page.locator("dl dd").nth(2).inner_text()) < claimed_all
    expect(page.locator("section", has=page.get_by_role("heading", name="Claims and redemptions over time")).locator("svg").first).to_be_visible()
    page.shot("partner-usage-data")


def test_13c_data_viewer_on_coupon_detail(page):
    """Coupon detail shows the Data Viewer: views, unique viewers and who opened it (and whether they claimed); exportable as CSV."""
    go(page, "Coupon list")
    row(page, "ลด 50% พิซซ่าถาดใหญ่").get_by_role("button", name="ลด 50% พิซซ่าถาดใหญ่").click()
    settle(page)
    viewers = page.locator("#coupon-viewers")
    expect(viewers.get_by_role("heading", name="Data Viewer")).to_be_visible()
    views = number(viewers.locator("dd").nth(0).inner_text())
    unique = number(viewers.locator("dd").nth(1).inner_text())
    claimed = number(viewers.locator("dd").nth(2).inner_text())
    assert views >= unique >= claimed > 0, (views, unique, claimed)
    expect(viewers.locator("tbody tr")).to_have_count(10)  # first page
    expect(viewers.get_by_text("Viewed only").first).to_be_visible()
    page.shot("coupon-data-viewer")
    with page.expect_download() as dl:
        viewers.get_by_role("button", name="Export CSV").click()
    lines = open(dl.value.path(), encoding="utf-8-sig", newline="").read().split("\r\n")
    assert lines[0] == '"User ID","Views","First viewed","Last viewed","Claimed","Redeemed"', lines[0]
    assert len(lines) == unique + 1, (len(lines), unique)


def test_14_brand_overview_numbers_and_contacts(page):
    """Partner Overview: numbers follow the campaign filter; contact changes are validated and saved."""
    go(page, "Partners")
    page.get_by_role("button", name="The Pizza Company").click()
    settle(page)
    numbers = page.locator("section", has=page.get_by_role("heading", name="Numbers"))
    all_claimed = number(numbers.locator("dd").first.inner_text())
    page.get_by_role("button", name="Campaign :").click()
    page.get_by_role("listbox", name="Campaign").get_by_text("Campaign 1 · Back to School", exact=True).click()
    assert 0 < number(numbers.locator("dd").first.inner_text()) < all_claimed

    page.get_by_label("Contact phone").fill("02-000-1111")
    page.get_by_label("Contact email").fill("not-an-email")
    page.get_by_role("button", name="Save changes").click()
    expect(page.get_by_text("Enter a valid email, e.g. name@brand.com.")).to_be_visible()
    page.get_by_label("Contact email").fill("ops@pizza.example")
    page.get_by_role("button", name="Save changes").click()
    toast(page, "Partner saved.")
    expect(page.get_by_label("Contact phone")).to_have_value("02-000-1111")
    page.shot("brand-overview")


def test_15_brand_default_conditions_from_settings(page):
    """A partner's default conditions pre-fill new coupons for it; they stay editable and never overwrite what the admin typed."""
    go(page, "Partners")
    page.get_by_role("button", name="Swensen's").click()
    page.get_by_role("tab", name=re.compile(r"^Settings")).click()
    editor = page.get_by_role("textbox", name="Default conditions")
    editor.click()
    page.keyboard.type("Swensen's: valid at all branches.")
    page.get_by_role("button", name="Save changes").click()
    toast(page, "Default conditions saved.")

    page.get_by_role("tab", name=re.compile(r"^Coupons")).click()
    page.get_by_role("button", name="Create coupon").click()
    settle(page)
    expect(page.get_by_role("heading", name="Create coupon")).to_be_visible()
    conditions = page.get_by_role("textbox", name="Conditions")
    expect(conditions).to_contain_text("Swensen's: valid at all branches.")
    expect(page.get_by_text("Filled in from Swensen's’s default conditions", exact=False)).to_be_visible()
    expect(page.locator("#coupon-preview")).to_contain_text("valid at all branches")
    page.shot("coupon-prefilled-conditions")

    # Untouched: switching brand switches to that brand's defaults.
    page.locator("#coupon-details").get_by_role("button", name="Change").click()
    page.get_by_placeholder("Search partner...").fill("Dairy")
    page.get_by_role("option", name="Dairy Queen").click()
    expect(conditions).to_contain_text("เฉพาะขนาด Small และ Medium")
    # Once the admin types, another brand's defaults don't overwrite it.
    conditions.click()
    page.keyboard.press("End")
    page.keyboard.type(" Admin edit.")
    page.locator("#coupon-details").get_by_role("button", name="Change").click()
    page.get_by_placeholder("Search partner...").fill("Pizza")
    page.get_by_role("option", name="The Pizza Company").click()
    expect(conditions).to_contain_text("Admin edit.")
    expect(page.get_by_role("button", name="Use them instead")).to_be_visible()


def test_16_brand_coupons_tab(page):
    """A partner's Coupons tab groups its coupons by campaign, with the same Active switch and Undo as the Coupon list."""
    go(page, "Partners")
    page.get_by_role("button", name="The Pizza Company").click()
    page.get_by_role("tab", name=re.compile(r"^Coupons")).click()
    groups = [g.strip() for g in page.locator('th[scope="rowgroup"] span.font-semibold').all_inner_texts()]
    assert groups == ["Not in a campaign", "Campaign 2 · Year-End Feast", "Campaign 1 · Back to School"], groups
    page.shot("brand-coupons")
    switch = row(page, "ฟรีขนมปังกระเทียม").get_by_role("switch")
    switch.click()
    expect(switch).to_have_attribute("aria-checked", "false")
    toast(page, "Coupon turned off").get_by_role("button", name="Undo").click()
    toast(page, "Change undone.")
    expect(switch).to_have_attribute("aria-checked", "true")
    row(page, "ลด 50% พิซซ่าถาดใหญ่").get_by_role("button", name="ลด 50% พิซซ่าถาดใหญ่").click()
    settle(page)
    expect(page.get_by_role("heading", name="Edit coupon")).to_be_visible()


# --- 8 ---

def test_08_bd_role_is_read_only_except_brand_notes(page, files):
    """As BD, no create / edit / delete controls on any page; on a partner page BD edits only contacts, and can add a note and upload a document."""
    switch_role(page, "BD")
    problems = {}
    for menu in ["Dashboard", "Partners", "Coupon list", "Campaigns", "Display"]:
        go(page, menu)
        page.shot(f"bd-{menu.lower().replace(' ', '-')}")
        found = visible_write_buttons(page)
        if menu == "Partners":
            page.get_by_role("tab", name="Logo order").click()
            found += visible_write_buttons(page)
        if menu == "Display":
            assert all(s.is_disabled() for s in page.get_by_role("switch").all())
        if menu == "Coupon list":
            assert page.get_by_role("checkbox").count() == 0
            assert all(s.is_disabled() for s in page.get_by_role("switch").all())
        if found:
            problems[menu] = found
    go(page, "Campaigns")
    page.get_by_role("button", name="Campaign 2 · Year-End Feast").click()
    page.shot("bd-phase-detail")
    if found := visible_write_buttons(page):
        problems["Campaign detail"] = found
    go(page, "Coupon list")
    row(page, "ลด 50% พิซซ่าถาดใหญ่").get_by_role("button", name="ลด 50% พิซซ่าถาดใหญ่").click()
    settle(page)
    page.shot("bd-coupon-details")
    if found := visible_write_buttons(page):
        problems["Coupon details"] = found
    assert not problems, f"BD can see write controls: {problems}"

    # Brand page: Overview (contacts editable), Coupons read-only, no Settings, notes and documents allowed.
    go(page, "Partners")
    page.get_by_role("button", name="The Pizza Company").click()
    settle(page)
    expect(page.get_by_role("tab", name=re.compile(r"^Settings"))).to_have_count(0)
    expect(page.get_by_label("Partner name")).to_be_disabled()
    expect(page.get_by_label("Contact phone")).to_be_enabled()
    page.shot("bd-brand-overview")
    page.get_by_role("tab", name=re.compile(r"^Coupons")).click()
    expect(page.get_by_role("button", name="Create coupon")).to_have_count(0)
    assert all(s.is_disabled() for s in page.get_by_role("switch").all())
    page.get_by_role("tab", name=re.compile(r"^Notes and documents")).click()
    panel = page.locator("section", has=page.get_by_role("tab", name=re.compile(r"^Documents")))
    panel.get_by_placeholder("Write a note for the team", exact=False).fill("E2E: BD note")
    panel.get_by_role("button", name="Add note").click()
    toast(page, "Note added.")
    expect(panel.locator("ol > li").first).to_contain_text("E2E: BD note")
    panel.get_by_role("tab", name=re.compile(r"^Documents")).click()
    panel.locator("input[type=file]").set_input_files(files["contract"])
    toast(page, "“contract.pdf” uploaded.")
    expect(panel.locator("ul > li").first).to_contain_text("Nattapong K.")
    page.shot("bd-brand-notes")


# --- 9: keyboard only (Tab / Enter; arrow keys only inside a list box, as the pattern requires) ---

def test_09_focus_checker_catches_invisible_focus(page):
    """Self-check for the keyboard tests: a button with its focus style removed must be flagged, a normal one must not."""
    page.evaluate(
        """() => {
          const box = document.createElement('div');
          // Plain CSS: Tailwind only generates classes it finds in the source files.
          box.innerHTML = '<style>#e2e-good:focus-visible { box-shadow: 0 0 0 2px #FF6115; }</style>'
            + '<button id="e2e-start">start</button>'
            + '<button id="e2e-bad" style="outline:none">no focus style</button>'
            + '<button id="e2e-good" style="outline:none">ring</button>'
            + '<button id="e2e-end">end</button>';
          document.body.prepend(box);
          // Tab continues from the focused element, so start just before the buttons under test.
          document.getElementById('e2e-start').focus();
        }"""
    )
    kb = Keyboard(page)
    kb.tab_to("el.id === 'e2e-end'", max_steps=5)
    assert kb.invisible == ["<button> no focus style"], kb.invisible

def test_09a_keyboard_coupon_form_and_add_brand(page, files):
    """Create a coupon, including adding a new partner, with the keyboard only; focus is visible at every stop."""
    go(page, "Coupon list")
    kb = Keyboard(page)
    kb.tab_to(name_is("Create coupon"))
    kb.press("Enter")
    settle(page)

    kb.tab_to("el.placeholder === 'e.g. ลด 100.-'")
    kb.type("KB coupon")

    kb.tab_to("el.placeholder === 'Search partner...'")
    kb.type("Sukishi")
    expect(page.get_by_text("No results for “Sukishi”.")).to_be_visible()
    kb.tab_to(name_is("Add new partner “Sukishi”"))
    kb.press("Enter")
    modal = page.get_by_label("Add new partner")
    expect(modal.get_by_role("textbox").first).to_have_value("Sukishi")
    kb.tab_to(name_is("Browse File"))
    with page.expect_file_chooser() as fc:
        kb.press("Enter")
    fc.value.set_files(files["logo"])
    expect(modal.get_by_role("button", name="Replace")).to_be_visible(timeout=8_000)
    page.shot("keyboard-add-brand")
    kb.tab_to(name_is("Add partner"))
    kb.press("Enter")
    toast(page, "“Sukishi” added.")
    expect(page.get_by_role("button", name="Open Sukishi in Partners")).to_be_visible()  # quick add links to the full partner page

    kb.tab_to(name_is("Browse File"))
    with page.expect_file_chooser() as fc:
        kb.press("Enter")
    fc.value.set_files(files["square"])
    expect(page.locator('fieldset:has(> legend:has-text("Coupon image"))').get_by_role("button", name="Replace")).to_be_visible(timeout=8_000)

    kb.tab_to("el.getAttribute('aria-label') === 'Conditions'")
    kb.type("Valid at all branches.")
    kb.tab_to("el.placeholder === 'e.g. PIZZA50OFF'")
    kb.type("KB-E2E-01")
    kb.tab_to("el.placeholder === 'e.g. 500'")
    kb.type("50")
    kb.tab_to("el.type === 'date'")
    kb.type(IN_20_DAYS.strftime("%d%m%Y"))  # Chromium's date field takes day, month, year here
    kb.tab_to("el.type === 'time'")
    kb.type("2000")
    page.shot("keyboard-coupon-form")
    kb.tab_to(name_is("Create coupon"))
    kb.leave()
    kb.press("Enter")
    toast(page, "Coupon created. Add it to a campaign on the Campaigns page to show it in the app.")
    expect(row(page, "KB coupon")).to_contain_text("Sukishi")
    expect_no_invisible_focus(kb)


def test_09d_keyboard_phase_form(page):
    """Create a campaign with the keyboard only; focus is visible at every stop."""
    go(page, "Campaigns")
    kb = Keyboard(page)
    kb.tab_to(name_is("Create campaign"))
    kb.press("Enter")
    page.get_by_role("heading", name="Create campaign").wait_for()
    kb.tab_to("el.placeholder === 'e.g. New Year 2027'")
    kb.type("KB campaign")
    start = date.today() + timedelta(days=200)
    kb.tab_to("el.type === 'date' && el.getAttribute('aria-label') === 'Start date'")
    kb.type(start.strftime("%d%m%Y"))
    kb.tab_to("el.type === 'date' && el.getAttribute('aria-label') === 'End date'")
    kb.type((start + timedelta(days=44)).strftime("%d%m%Y"))
    expect(page.get_by_text("45 days")).to_be_visible()
    page.shot("keyboard-phase-form")
    kb.tab_to(name_is("Save campaign"))
    kb.leave()
    kb.press("Enter")
    toast(page, "Campaign created.")
    expect(page.get_by_role("heading", name="KB campaign")).to_be_visible()
    expect_no_invisible_focus(kb)


def test_09b_keyboard_banner_form(page, files):
    """Add a banner with the keyboard only; focus is visible at every stop."""
    go(page, "Display")
    kb = Keyboard(page)
    kb.tab_to(name_is("Add banner"))
    kb.press("Enter")
    drawer = page.get_by_role("dialog")
    kb.tab_to(name_is("Browse File"))
    with page.expect_file_chooser() as fc:
        kb.press("Enter")
    fc.value.set_files(files["banner"])
    expect(drawer.get_by_role("button", name="Replace")).to_be_visible(timeout=8_000)
    kb.tab_to("el.placeholder === 'e.g. Year-End Feast — ลดสูงสุด 50%'")
    kb.type("KB banner")
    kb.tab_to("el.placeholder === 'https://'")
    kb.type("https://peepshare.ai/kb")
    page.shot("keyboard-banner-form")
    kb.tab_to(f"{name_is('Add banner')} && el.closest('[role=dialog]')")
    kb.leave()
    kb.press("Enter")
    toast(page, "Banner added at the end of the order.")
    assert banner_titles(page)[-1] == "KB banner"
    expect_no_invisible_focus(kb)


def test_09c_keyboard_brand_note_and_document(page, files):
    """Open a partner from the Coupon list, add a note and upload a document, with the keyboard only; focus is visible at every stop."""
    go(page, "Coupon list")
    kb = Keyboard(page)
    kb.tab_to(name_is("The Pizza Company"))
    kb.press("Enter")
    expect(page.get_by_role("heading", name="The Pizza Company")).to_be_visible()
    settle(page)
    kb.tab_to("el.getAttribute('role') === 'tab' && el.innerText.startsWith('Notes and documents')")
    kb.press("Enter")
    settle(page)
    kb.tab_to("el.placeholder && el.placeholder.startsWith('Write a note for the team')")
    kb.type("KB note")
    kb.tab_to(name_is("Add note"))
    kb.press("Enter")
    toast(page, "Note added.")
    kb.tab_to("el.getAttribute('role') === 'tab' && el.innerText.startsWith('Documents')")
    kb.press("Enter")
    kb.tab_to(name_is("Upload file"))
    with page.expect_file_chooser() as fc:
        kb.press("Enter")
    fc.value.set_files(files["contract"])
    toast(page, "“contract.pdf” uploaded.")
    kb.leave()
    page.shot("keyboard-brand-notes")
    expect_no_invisible_focus(kb)


# --- 10: console errors (the check itself lives in conftest.py and runs after every test) ---

def test_10_console_error_capture_works(page, request):
    """Self-check for flow 10: console.error and uncaught exceptions are both captured."""
    page.evaluate("console.error('e2e probe: console.error')")
    page.evaluate("setTimeout(() => { throw new Error('e2e probe: uncaught') })")
    page.wait_for_timeout(300)
    captured = list(request.node.console_errors)
    assert any("e2e probe: console.error" in e for e in captured), captured
    assert any("e2e probe: uncaught" in e for e in captured), captured
    request.node.console_errors.clear()  # the probe errors are expected here; every other test fails on them
