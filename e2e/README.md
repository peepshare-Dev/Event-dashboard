# Coupon e2e tests

Playwright (Python, sync API, headless Chromium) end-to-end tests for the Coupon service.

```sh
python3 -m pip install -r e2e/requirements.txt
python3 -m playwright install chromium
python3 -m pytest e2e            # from the project root
python3 -m pytest e2e -k test_04 # one test
```

- Uses the dev server on `http://localhost:8443/` if it's running, otherwise starts `vite` and stops it afterwards. Override with `E2E_BASE_URL`.
- Writes to `/tmp/screens/` (override with `E2E_SCREENS`): a full-page screenshot of every page a test visits, `<test>__FAILED.png` for failures, `<test>.console.log` for every test, and `report.md` with the results.
- Any browser console error or uncaught exception fails the test that caused it.
- The API is the in-memory mock, so each test starts from the seed data, and a full browser reload resets it (see `test_05b`).
