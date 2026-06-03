# PSA v2 — Action tools (wire-up guide)

PSA v1 uses **read-only** tools: `search_faq`, `search_products`, `suggest_navigation`.

PSA v2 adds **member-scoped actions** that call the same Supabase data as `/api/orders`, `/api/cart`, booking checkout, and Concierge — using the **user’s JWT** from `POST /api/psa/chat`.

---

## Architecture

```
Mobile PSA chat
  POST /api/psa/chat  (Bearer JWT)
    ├─ getPsaPremiumProfile
    ├─ OpenAI Responses API + tools
    └─ executePsaActionTool(userId, accessToken, email, name, args)
           ├─ Supabase (orders, cart, meetings, priority_messages)
           └─ returns JSON → model → reply + optional clientActions
```

**Rules**

- All action tools run **server-side only** (never expose OpenAI or service keys to the browser).
- Reuse **`getAuthUser`** + **`getSupabaseUser(accessToken)`** (same as `api/orders.ts`, `api/cart.ts`).
- After **cart mutations**, return `clientActions: [{ type: 'sync_cart' }]` so the app runs `syncCartFromApi()` and refreshes `localStorage.cartItems`.
- PSA **cannot skip checkout** for bookings — it can **add booking lines to cart** or **hand off** to `/booking/*` when photos/UI are required.

---

## Tool catalog

| Tool | Purpose | Backend today | PSA v2 work |
|------|---------|---------------|-------------|
| `search_faq` | Policies, care, loyalty | Static `psaKnowledge.ts` | ✅ Done |
| `search_products` | Unit catalog | Static | ✅ Done |
| `suggest_navigation` | In-app paths | Static | ✅ Done |
| **`get_member_orders`** | List active/past orders | `GET /api/orders` | ✅ Wired in `psaTools.ts` |
| **`get_order_status`** | One order + tracking stage | Orders JSONB + tracking logic | ✅ Wired |
| **`get_member_cart`** | Current bag | `GET /api/cart` | ✅ Wired |
| **`add_to_cart`** | Append line(s) | `PUT /api/cart` (full replace) | ✅ Wired (units + booking lines) |
| **`prepare_booking_handoff`** | What’s missing before book | Booking page validation rules | ✅ Wired (collect + path) |
| **`send_priority_message`** | Concierge inbox | **Was localStorage only** | Needs `POST /api/concierge/priority-message` + Supabase table + admin hub read |

---

## 1. Live order / tracking lookup

### Tool: `get_member_orders`

```json
{ "limit": 5, "includePast": false }
```

**Server:** `orders` table → `{ active_orders, past_orders }` JSONB.

**Returns (summarized for the model):**

```json
{
  "orders": [
    {
      "id": "order-332",
      "orderNumber": "ORDER #332",
      "status": "PROCESSING",
      "productName": "NOIR",
      "total": 780,
      "trackingStageLabel": "CONSTRUCTING UNIT",
      "trackingStageIndex": 2,
      "trackingNumber": "9400…",
      "requiresOrderForm": true,
      "orderFormSigned": false,
      "bookingFlowType": null
    }
  ]
}
```

**Tracking:** Port of `getOrderTrackingStageFromOrder()` → `api/_lib/psaOrderTracking.ts` (no `localStorage`).

### Tool: `get_order_status`

```json
{ "orderNumber": "ORDER #332" }
```

Single-order detail + carrier tracking URL when `trackingNumber` exists.

**No separate tracking API** — all fields live on the order object in Supabase/local sync.

---

## 2. Add to cart from chat

### Tool: `add_to_cart`

There is **no** `POST /api/cart/add`. Pattern:

1. `GET` cart (`items`, `version`)
2. Append validated line(s)
3. `PUT` cart with `baseVersion` (handle `409` conflict)

### Line types

#### A. Unit (simple)

```json
{
  "lineType": "unit",
  "unitId": "noir",
  "capSize": "S/M/L",
  "quantity": 1
}
```

Maps `unitId` → `PSA_PRODUCTS` in `psaKnowledge.ts`. Uses **default base price** ($740) — user customizes in bag or Build-a-Wig. Prefer **`/build-a-wig/{unit}`** for full customization.

#### B. Consult deposit ($40)

```json
{
  "lineType": "booking-consult",
  "bookingTier": "premium",
  "bookingHairOption": "WIG ONLY",
  "bookingHeadMeasurements": { "circumference": "22", "frontToNape": "14" },
  "bookingNotes": "…",
  "bookingInspoPhotoUrls": ["https://…"]
}
```

**Hard requirement:** ≥1 inspo photo URL (https or data URL). Without photos → use **`prepare_booking_handoff`** instead (PSA sends user to `/booking/consultation`).

`WIG + INSTALL` requires premium + preferred date/time (≥2 months weekday rules — mirror `bookingDateRules.ts`).

#### C. Appointment (premium only)

```json
{
  "lineType": "booking-appointment",
  "bookingInstallKind": "NEW_INSTALL",
  "bookingStyle": "BONE STRAIGHT",
  "bookingPartDirection": "MIDDLE",
  "bookingAddonIds": ["braids"],
  "bookingPreferredDate": "2026-08-15",
  "bookingPreferredTime": "2:00 PM",
  "bookingNotes": "…"
}
```

Price from `api/_lib/pricing/resolveQuote.ts` (same as checkout quote).

**After success:** `{ ok: true, cartItemCount, checkoutPath: "/checkout/bookings" }` + client `sync_cart`.

---

## 3. In-chat booking (realistic flow)

Booking is **not** one API call from PSA. Production flow:

```
PSA conversation (collect fields)
  → add_to_cart (booking-consult | booking-appointment)  OR  prepare_booking_handoff
  → User completes photos/UI on /booking/* if needed
  → /checkout/bookings → payment
  → POST /api/booking/consult-meeting | appointment-meeting (after confirm)
  → Supabase `meetings` row
```

### Tool: `prepare_booking_handoff`

```json
{
  "bookingType": "consult",
  "collected": {
    "bookingHairOption": "WIG ONLY",
    "bookingHeadMeasurements": { "circumference": "22", "frontToNape": "14" }
  }
}
```

**Returns:**

```json
{
  "readyForCart": false,
  "missing": ["bookingInspoPhotoUrls"],
  "nextPath": "/booking/consultation",
  "message": "Love, I need at least one inspo photo before I can hold your consult slot — tap through here."
}
```

Optional **Phase 2b:** `psa_booking_drafts` table + `?psaDraft=` on booking pages to pre-fill forms from chat.

### Meeting APIs (post-checkout only — PSA does not call these directly)

| Endpoint | When |
|----------|------|
| `POST /api/booking/consult-meeting` | After consult deposit paid |
| `POST /api/booking/appointment-meeting` | After appointment paid + date/time on cart line |

---

## 4. Priority messages from chat

### Today (gap)

Concierge writes **`localStorage.adminPriorityMessages`** only — **no server API**, no cross-device, PSA cannot send.

### Required build

1. **Migration** `priority_messages` table:

```sql
CREATE TABLE public.priority_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_email text NOT NULL,
  client_name text,
  message text NOT NULL,
  is_order_related boolean DEFAULT false,
  is_urgent boolean DEFAULT false,
  related_order_id text,
  status text NOT NULL DEFAULT 'new',
  source text DEFAULT 'concierge',  -- 'concierge' | 'psa'
  created_at timestamptz DEFAULT now()
);
-- RLS: users INSERT own row; admin reads via service role API
```

2. **`POST /api/concierge/priority-message`** — Bearer JWT, gate **6mo+ or 12mo subscription or BLACK** (match Concierge perk).

3. **`GET /api/admin/priority-messages`** — admin inbox (merge with legacy localStorage in `adminMessagesHub.ts`).

4. **Tool: `send_priority_message`**

```json
{
  "message": "…",
  "isOrderRelated": true,
  "relatedOrderId": "order-332",
  "isUrgent": false
}
```

5. Update **`concierge/page.tsx`** to POST instead of localStorage-only.

---

## OpenAI tool definitions (register in `api/psa/chat.ts`)

Add to `PSA_TOOLS` array alongside search tools. Execute in `api/_lib/psaTools.ts` → `executePsaActionTool()`.

After tool loop, if any tool returned `clientActions`, include in HTTP response:

```json
{
  "reply": "…",
  "responseId": "…",
  "model": "gpt-5.4-mini",
  "clientActions": [{ "type": "sync_cart" }, { "type": "navigate", "path": "/checkout/bookings" }]
}
```

### Client (`src/utils/psaApi.ts` + `usePsaChat.ts`)

```typescript
for (const action of result.clientActions ?? []) {
  if (action.type === 'sync_cart') await syncCartFromApi();
  if (action.type === 'navigate') navigate(action.path);
}
```

---

## Premium gates per tool

| Tool | Gate |
|------|------|
| Search tools | Premium (PSA chat gate) |
| Orders / cart read | Signed in + premium |
| `add_to_cart` unit | Premium |
| `add_to_cart` appointment | Premium membership |
| `send_priority_message` | 6mo / 12mo / BLACK (stricter than general PSA) |
| `get_order_status` live timeline | 6mo / 12mo / BLACK — 3mo gets basic status only |

---

## Implementation checklist

- [x] `api/_lib/psaOrderTracking.ts` — server tracking stage
- [x] `api/_lib/psaTools.ts` — orders, cart, add_to_cart, booking handoff
- [x] `api/psa/chat.ts` — register action tools + `clientActions`
- [ ] `supabase/migrations/…_priority_messages.sql`
- [ ] `api/concierge/priority-message.ts`
- [ ] `api/admin/priority-messages.ts` + admin hub merge
- [ ] `concierge/page.tsx` → POST priority message
- [ ] `psaInstructions.ts` — allow actions; keep honest limits (checkout still required)
- [ ] `psaApi.ts` / `usePsaChat.ts` — `clientActions`
- [ ] Optional: `psa_booking_drafts` + booking page prefill

---

## Env (unchanged)

- `OPENAI_API_KEY`, optional `PSA_OPENAI_MODEL`
- Supabase keys (existing)
- No new keys for v2 tools

---

## Testing

```bash
# Premium JWT required
curl -s -X POST "$DEPLOY/api/psa/chat" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Where is my latest order?"}'
```

Ask PSA: “What’s the status of ORDER #332?” → should call `get_order_status`.

Ask: “Add NOIR to my bag” → `add_to_cart` → `sync_cart` on client.

Ask: “Book a consult” without photos → `prepare_booking_handoff` → `/booking/consultation`.
