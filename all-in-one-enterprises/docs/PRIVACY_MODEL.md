# All In One — Privacy Model

**Sprint 19** · Compliance-supporting controls — **not** a claim of GDPR/CCPA/legal compliance.

---

## Privacy requests

Model: `PrivacyRequest` — types `ACCESS`, `EXPORT`, `CORRECTION`, `DELETION`, `RESTRICTION`, `OTHER`.

States: `SUBMITTED` → verification → review → completion/denial.

**Identity verification** required before fulfilling sensitive requests. Email alone is not sufficient.

---

## Deletion

No automatic `DELETE CASCADE`. Staff review identifies deletable, anonymizable, retained, and restricted records. Legal/business review items marked **TBD**.

---

## Consent

Unified evidence model aligns with Sprint 16 communications consents and integration consents. Do not collapse distinct consent purposes into one boolean.

---

## Retention

`DataRetentionPolicy` registry — periods marked **TBD — LEGAL/BUSINESS REVIEW REQUIRED** where policy not verified.

Retention engine foundation only; **no destructive automated retention in debug**.

---

## Customer controls

Portal: `/portal/settings/privacy` — requests, connection visibility link.

Staff: `/office/privacy` — inventory, retention registry, vendor registry, request review.
