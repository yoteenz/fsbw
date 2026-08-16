# All In One — Browser Compatibility

Route: `/all-in-one/office/system/qa/browsers`

**Rule:** Do not mark PASS unless that browser was actually executed.

---

## Matrix

| Browser | Version | Tested | Environment | Smoke result |
|---------|---------|--------|-------------|--------------|
| Chromium | Playwright bundled | **Yes** | Local dev :3001 | **15/15 PASS** |
| Firefox | — | **No** | NOT_TESTED | — |
| Safari / WebKit | Playwright webkit available | **No** | NOT_TESTED | Run: `npx playwright install webkit` |
| Edge | — | **No** | NOT_TESTED | Chromium-based; low risk for demo |

---

## Chromium smoke coverage (2026-08-16)

File: `e2e/all-in-one/smoke.spec.ts`

- Public: home, services, skip link
- Portal: dashboard, road-ready
- Office: home, QA center, data health (with security staff persona)
- Routes: contact, about, get-started, crm, dispatch, management, security

Command:

```bash
E2E_BASE_URL=http://localhost:3001 npx playwright test --project=aio-demo e2e/all-in-one/
```

---

## iOS Safari notes (manual, not executed)

Pay attention when testing on device:

- `100vh` / fixed nav
- Date and file inputs
- Modal scroll lock
- Safe area insets

---

## Frontal Slayer regression

FS storefront/admin browsers unchanged by AIO Sprint 21. Full FS browser matrix is out of scope for this document.

---

## Recommendations

1. Add `aio-demo-webkit` Playwright project for portal + public smoke
2. Founder device test on iOS Safari for Road Ready onboarding before production
