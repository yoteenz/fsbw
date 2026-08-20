# Studio World External Integration Contract v1

**Contract version:** `v1`  
**Status:** IMPLEMENTED — server-side API + HMAC auth + idempotent provisioning  
**Consumer scope:** Any external commercial system (e.g. future SITE 00 server layer)  
**SITE 00:** NOT connected in this sprint — this document is sufficient for independent implementation

---

## Overview

Studio World exposes a **provider-agnostic, client-safe** HTTP boundary. External systems provision campaigns, poll status, submit reviews, and retrieve approved deliverables without access to internal prompts, provider credentials, failed takes, or operator notes.

```
External System (server)
  → HMAC-authenticated HTTPS
  → Studio World /api/studio-world/v1/campaigns
  → studio_vp_* tables (service role)
  → Client-safe sanitized responses
```

---

## Authentication

**Method:** HMAC-SHA256 v1 (server-to-server only)

| Header | Description |
|--------|-------------|
| `X-Studio-World-System` | Registered external system id |
| `X-Studio-World-Timestamp` | Unix ms — must be within ±5 minutes |
| `X-Studio-World-Signature` | HMAC hex digest |

**Signature payload:** `{system}.{timestamp}.{rawBody}`

**Secret:** Environment variable `STUDIO_WORLD_EXTERNAL_API_SECRET` on Studio World deploy (never in browser).

**Registered systems (pilot):**

| System id | Maps to org_id |
|-----------|----------------|
| `frontal-slayer` | `frontal-slayer` |
| `fs-internal` | `frontal-slayer` |
| `studio-world-test` | `frontal-slayer` |

Unknown systems → `403 UNKNOWN_SYSTEM`

Implementation: `api/_lib/virtualProduction/external-auth.ts`

---

## Base URL

Production: `https://{studio-world-host}/api/studio-world/v1/campaigns`

All responses include `contractVersion: "v1"` on success and error.

---

## Endpoints

### 1. Provision Campaign (idempotent)

**POST** `?action=provision`

**Request body:**

```json
{
  "externalSystem": "studio-world-test",
  "externalEngagementId": "eng-unique-stable-id",
  "externalProjectId": "optional-project-id",
  "externalClientId": "optional-client-id",
  "clientVisibleProjectId": "optional-display-id",
  "brandId": "optional-brand-uuid",
  "brandSetupRequired": false,
  "engagementType": "social_campaign",
  "serviceType": "content_production",
  "campaignObjective": "High-consistency social pilot",
  "platforms": ["instagram_reels", "tiktok"],
  "aspectRatios": ["9:16"],
  "quantity": 1,
  "deadline": "2026-09-01T00:00:00Z",
  "approvedScope": "Campaign 001 pilot scope"
}
```

**Required:** `externalSystem`, `externalEngagementId`

**Response (201 create / 200 replay):**

```json
{
  "contractVersion": "v1",
  "studioWorldCampaignId": "uuid",
  "externalEngagementId": "eng-unique-stable-id",
  "status": "provisioned",
  "currentPhase": "initialized",
  "brandSetupRequired": false,
  "createdAt": "ISO8601",
  "idempotentReplay": false
}
```

**Idempotency:** Unique key `(org_id, external_system, external_engagement_id)`. Retries return existing campaign with `idempotentReplay: true`.

Types: `src/studio-os-core/virtual-production/external/contract-v1.ts`

---

### 2. Client-Safe Status

**GET** `?campaignId={uuid}&externalEngagementId={id}`

**Response:**

```json
{
  "contractVersion": "v1",
  "campaignId": "uuid",
  "status": "production_started",
  "currentPhase": "storyboard",
  "progress": {
    "shotsTotal": 9,
    "shotsApproved": 1,
    "shotsRepair": 1,
    "shotsNotReviewed": 7
  },
  "latestMilestone": "preproduction",
  "clientInputRequired": true,
  "reviewReady": true,
  "deliverablesReady": false,
  "updatedAt": "ISO8601"
}
```

**Not exposed:** prompts, provider responses, internal QC notes, failed candidates, cost data.

---

### 3. Client-Safe Reviews

**GET** `?action=reviews&campaignId={uuid}&externalEngagementId={id}`

**Response:**

```json
{
  "contractVersion": "v1",
  "reviews": [
    {
      "reviewId": "uuid",
      "campaignId": "uuid",
      "type": "direction",
      "title": "Campaign 001 Direction Review",
      "clientSafeDescription": "Review the creative direction...",
      "previewAssets": [],
      "allowedActions": ["approve", "request_revision"],
      "status": "pending",
      "createdAt": "ISO8601"
    }
  ]
}
```

---

### 4. Submit Review

**POST** `?action=submit_review&campaignId={uuid}&externalEngagementId={id}`

**Body:**

```json
{
  "reviewId": "uuid",
  "action": "approve",
  "notes": "Optional client-safe notes"
}
```

**Actions:** `approve` | `request_revision` | `select_direction`

**Response:** `{ "contractVersion": "v1", "ok": true }`

Unauthorized → `403 UNAUTHORIZED`

---

### 5. Approved Deliverables

**GET** `?action=deliverables&campaignId={uuid}&externalEngagementId={id}`

Returns only `client_visible: true` AND `approval_state: approved` deliverables.

```json
{
  "contractVersion": "v1",
  "deliverables": [
    {
      "deliverableId": "uuid",
      "campaignId": "uuid",
      "title": "social-master-001",
      "type": "video",
      "format": "instagram_reels",
      "aspectRatio": "9:16",
      "version": "1",
      "preview": "https://...",
      "deliveryAsset": "https://...",
      "status": "delivered"
    }
  ]
}
```

Pilot: deliverable not yet client-visible — empty array expected until approval.

---

### 6. Client-Safe Activity (optional)

**GET** `?action=activity&campaignId={uuid}&externalEngagementId={id}`

```json
{
  "contractVersion": "v1",
  "activity": [
    {
      "activityType": "campaign_initialized",
      "message": "Campaign initialized — direction in progress",
      "createdAt": "ISO8601"
    }
  ]
}
```

Activity types: `campaign_initialized`, `direction_in_progress`, `production_started`, `review_ready`, `revision_in_progress`, `deliverable_ready`, `campaign_complete`

---

## Authorization Model

Every read/write validates:

1. HMAC auth → `external_system` → `org_id`
2. `studio_vp_external_engagements` row linking `external_engagement_id` + `campaign_id`

Cross-tenant access denied.

---

## Error Codes

| Code | HTTP | Meaning |
|------|------|---------|
| `AUTH_REQUIRED` | 401 | Missing headers |
| `INVALID_SIGNATURE` | 401 | Bad HMAC |
| `TIMESTAMP_EXPIRED` | 401 | Clock skew |
| `UNKNOWN_SYSTEM` | 403 | Unregistered system |
| `UNAUTHORIZED` | 403 | Campaign not linked to engagement |
| `INVALID_PAYLOAD` | 400 | Validation failed |
| `MISSING_PARAMS` | 400 | Required query params |
| `EXTERNAL_API_NOT_CONFIGURED` | 503 | Secret not set |
| `INTERNAL_ERROR` | 500 | Server error (no raw diagnostics) |

---

## Client-Safe Data Policy

**Never expose to external consumers:**

- Internal prompts and model settings
- Provider API keys / raw provider responses
- Unapproved generation assets / failed takes
- Private operator QC comments
- Cost / usage unless explicitly marked client-safe

---

## Events / Webhooks

**Status:** ARCHITECTED ONLY

`studio_vp_production_events` records events with `delivery_status: recorded`. Outbound webhooks not implemented — **use polling** on status/reviews/deliverables endpoints.

Prepared event types: `CAMPAIGN_CREATED`, `REVIEW_READY`, `DELIVERABLE_READY`, `CAMPAIGN_COMPLETE`, etc.

---

## TypeScript Types

`src/studio-os-core/virtual-production/external/contract-v1.ts`:

- `ProvisionCampaignRequestV1`
- `ProvisionCampaignResponseV1`
- `ClientSafeCampaignStatusV1`
- `ClientSafeReviewV1`
- `ClientSafeDeliverableV1`
- `ClientSafeActivityV1`
- `validateProvisionRequest()`
- `validateReviewSubmission()`

---

## Test Harness

Offline tests (no HTTP):

```
api/_lib/virtualProduction/external-contract.test.ts
```

Run: `npm test -- external-contract`

Covers: validation, HMAC auth, idempotency key shape, unauthorized system rejection.

---

## What External Consumer Must Implement (e.g. SITE 00)

1. Store `STUDIO_WORLD_EXTERNAL_API_SECRET` server-side only
2. Implement HMAC signing for all requests
3. Provision on purchase/authorization with stable `externalEngagementId`
4. Poll status / reviews / deliverables (or subscribe when webhooks ship)
5. Render client-safe review UI from `ClientSafeReviewV1` only
6. Never call Studio World from browser with privileged credentials

**Do not** import Studio World source or assume internal schema stability — depend on this contract v1 only.

---

## Future Evolution (documented, not implemented)

```
SITE 00 → EVOLVE → Marketing & Content → Purchase/Auth
  → Server-side PROVISION → Studio World → Production
  → Client-safe status → SITE 00 Studio → Review → Approval
  → Deliverable → SITE 00 Vault
```

Studio World knows production. External systems know commerce/client experience.

---

## Extraction Note

When Studio World becomes its own repository, move:

- `src/studio-os-core/virtual-production/`
- `api/studio-world/v1/`
- `api/_lib/virtualProduction/external-*`
- `studio_vp_*` migrations

Frontal Slayer remains a tenant consumer, not the owner.
