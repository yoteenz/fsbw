# All In One Custom Icon Library

**Canonical design inventory** · Refinement 03E / 03E.1 / 03F / 03F.1 / 03F.2  
**Source artwork:** Black stroke icons on transparent PNG canvases  
**Registry:** `all-in-one-enterprises/src/config/aioIconRegistry.ts`  
**Component:** `<AIOIcon icon="…" size={n} />` — `object-fit: contain`, centered

---

## Production standards (03F.2)

| Property | Value |
|----------|-------|
| Source canvas | **512 × 512 px** transparent RGBA |
| Artwork occupancy | **63–68%** (optical; detail icons ~63–66%) |
| Edge clearance | **≥ 16%** on all sides |
| Canonical color | Black artwork only — no gold/white source variants |
| Extraction | Largest connected cluster + label-band exclusion + 5% cell bleed |
| Cache bust | `AIO_ICON_ASSET_VERSION` query on `getAioIconSrc()` |

**Debug QA route (non-production only):** `/debug/icon-library`

**Re-extraction:**

```bash
cd all-in-one-enterprises
python3 scripts/extract-platform-icon-sheets.py
python3 scripts/extract-service-icons.py
python3 scripts/audit-expanded-icon-library.py
python3 scripts/verify-icon-assets.py
```

---

## Homepage service icons (03E / 03E.1)

Protected — **do not replace** with expanded-library equivalents.

| Registry key | Purpose | Filename | Path |
|--------------|---------|----------|------|
| `serviceStartBusiness` | START MY BUSINESS card | `aio-icon-start-business.png` | `/brand/icons/services/` |
| `servicePermitsCompliance` | PERMITS & COMPLIANCE card | `aio-icon-permits-compliance.png` | `/brand/icons/services/` |
| `serviceTruckingInsurance` | TRUCKING INSURANCE card (**03E.1 standalone**) | `aio-icon-trucking-insurance.png` | `/brand/icons/services/` |
| `serviceDispatch` | DISPATCH MY TRUCKS card | `aio-icon-dispatch.png` | `/brand/icons/services/` |
| `serviceMoveFreight` | MOVE FREIGHT card | `aio-icon-move-freight.png` | `/brand/icons/services/` |
| `serviceGetPaidFaster` | GET PAID FASTER card | `aio-icon-get-paid-faster.png` | `/brand/icons/services/` |

**Display range:** 48–56 px in service pathway cards (CSS wrapper).  
**Min recommended:** 40 px.

---

## Compliance + Business (8 icons)

**Source sheet (visual content):** `public/brand/icons/platform/_source-master-finance-platform.png`  
*(Archived filename inverted — see 03F.2 report)*

| Registry key | Purpose | Filename | Min display |
|--------------|---------|----------|-------------|
| `companyFormation` | LLC / INC / company setup | `aio-icon-company-formation.png` | 32 px |
| `operatingAuthority` | USDOT / MC authority | `aio-icon-operating-authority.png` | 32 px |
| `permits` | Permits & compliance docs | `aio-icon-permits.png` | 32 px |
| `boc3` | BOC-3 filing | `aio-icon-boc3.png` | 32 px |
| `iftaFuelTax` | IFTA / fuel tax | `aio-icon-ifta-fuel-tax.png` | 32 px |
| `irpRoadTax` | IRP / road tax | `aio-icon-irp-road-tax.png` | 32 px |
| `renewals` | Renewals / calendar refresh | `aio-icon-renewals.png` | 32 px |
| `documentVault` | Document vault / security | `aio-icon-document-vault.png` | 32 px |

**Asset folder:** `public/brand/icons/compliance/`  
**Display range:** 32–64 px

---

## Fleet + Freight (8 icons)

**Source sheet:** `public/brand/icons/freight/_source-master-fleet-freight.png`

| Registry key | Purpose | Filename | Min display |
|--------------|---------|----------|-------------|
| `fleet` | Fleet / truck profile | `aio-icon-fleet.png` | 32 px |
| `driver` | Driver / cap bust | `aio-icon-driver.png` | 32 px |
| `operationsDispatch` | Dispatch operations (**≠** `serviceDispatch`) | `aio-icon-dispatch-operations.png` | **40 px** |
| `loadFreight` | Load / freight / cargo | `aio-icon-load-freight.png` | 32 px |
| `routeTracking` | Route / tracking / pins | `aio-icon-route-tracking.png` | **40 px** |
| `bolPod` | BOL / POD documents | `aio-icon-bol-pod.png` | **40 px** |
| `shipper` | Shipper / warehouse | `aio-icon-shipper.png` | 32 px |
| `brokerage` | Brokerage / handshake | `aio-icon-brokerage.png` | 32 px |

**Asset folder:** `public/brand/icons/freight/`  
**Display range:** 32–64 px (40 px min for detail silhouettes)

---

## Finance + Platform (8 icons)

**Source sheet (visual content):** `public/brand/icons/compliance/_source-master-compliance-business.png`  
*(Archived filename inverted — see 03F.2 report)*

| Registry key | Purpose | Filename | Min display |
|--------------|---------|----------|-------------|
| `factoring` | Factoring / cash flow (**≠** `serviceGetPaidFaster`) | `aio-icon-factoring.png` | **40 px** |
| `invoiceBilling` | Invoice / billing | `aio-icon-invoice-billing.png` | **40 px** |
| `payments` | Payments / payouts | `aio-icon-payments.png` | 32 px |
| `reportsAnalytics` | Reports / analytics | `aio-icon-reports-analytics.png` | 32 px |
| `messages` | Messages / chat | `aio-icon-messages.png` | 32 px |
| `notifications` | Notifications / bell | `aio-icon-notifications.png` | **40 px** |
| `calendarScheduling` | Calendar / scheduling | `aio-icon-calendar-scheduling.png` | **40 px** |
| `support` | Support / help | `aio-icon-support.png` | 32 px |

**Asset folder:** `public/brand/icons/platform/`  
**Display range:** 32–64 px

**Note:** `bookkeeping` registry key temporarily aliases `reportsAnalytics` until dedicated artwork is approved.

---

## Semantic overlap (intentional)

| Concept | Homepage (03E) | Expanded library (03F) |
|---------|----------------|------------------------|
| Dispatch | `serviceDispatch` | `operationsDispatch` |
| Factoring | `serviceGetPaidFaster` | `factoring` |
| Insurance | `serviceTruckingInsurance` (standalone) | Uses homepage key in roadmap |

---

## Rendering rules

```css
.aio-icon {
  object-fit: contain;
  object-position: center;
  max-width: 100%;
  max-height: 100%;
  flex-shrink: 0;
}
```

- **Never** use `object-fit: cover` for these assets  
- **Never** clip icon wrappers with `overflow: hidden` on service cards  
- Decorative icons: `alt=""` when visible text label exists

---

## Audit artifacts

| File | Purpose |
|------|---------|
| `scripts/audit-expanded-icon-library.py` | Full 24-icon QA + contact sheet |
| `docs/design/aio-expanded-icon-audit.json` | Machine-readable audit results |
| `public/brand/icons/_qa-expanded-icon-contact-sheet.png` | Visual contact sheet |

---

## Future UI integration

These 24 icons are production-ready for: Road Ready™, Client Portal, All In One Office, Dispatch, Brokerage, Bookkeeping, Compliance, Fleet, Finance, Support — import via `getAioIconSrc('fleet')` etc.
