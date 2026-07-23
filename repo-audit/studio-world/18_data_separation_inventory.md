# Studio World — Data Separation Inventory

**Rule:** No data moved. Classification per object.

**Categories:** Studio World-only · Frontal Slayer-only · Mixed · Shared infrastructure · Ownership unclear

**Supabase project (observed):** FS Website production `hyycomvcaqxxvyrfupes` — **shared infrastructure** for both products today.

---

## Studio World-only tables (Postgres)

All introduced in `supabase/migrations/202607*` with `studio_` / `studio_os_` prefixes:

| Table group | Classification | Notes |
| --- | --- | --- |
| `studio_os_org_memberships` | SW-only data | Links users to org Studio access |
| `studio_os_workspace_state` | SW-only | JSON workspace persistence |
| `studio_governed_generation_jobs` | SW-only | Async jobs |
| `studio_asset_registry_*` (5 tables) | SW-only | Asset graph |
| `studio_creative_intelligence_*` | SW-only | |
| `studio_social_*` (3 tables) | SW-only | Studio publishing |
| `studio_institute_invites` | SW-only | |
| `studio_founder_render_jobs`, `studio_master_*`, `studio_composition_*` | SW-only | Renders |
| `studio_industry_packs`, `studio_business_archetypes`, `studio_department_templates`, etc. | SW-only | Packs/marketplace |
| `studio_canonical_departments`, `studio_company_hq_instances` | SW-only | Canonical world |
| `studio_department_ui_sockets` | SW-only | Architecture law |
| `studio_world_canonical_departments` + related charter/blueprint/render/publication tables | SW-only | Department generator |
| `studio_environment_*` (packages, jobs, audit, handoffs, cache) | SW-only | Environment pipeline |

**RLS/policies:** Defined per migration on above tables — scoped to org/service patterns; **not audited statement-by-statement** in this inventory.

---

## Frontal Slayer-only tables

Customer commerce, cart, orders, products, memberships (customer), PSA, etc. — **FS-only** for Studio World operation (Studio does not require them for core HQ runtime per `07_database.md` scope).

**Coexistence:** Same database **schema** — separation is logical, not physical.

---

## Mixed / shared identity data

| Object | Classification | Evidence |
| --- | --- | --- |
| `auth.users` | **Shared infrastructure** | Single Supabase Auth |
| User profile tables used by FS admin + Studio admin | **Mixed** | Same signed-in user accesses both via `/admin` |
| `studio_os_org_memberships.user_id` → auth users | **Mixed** | SW table, shared user identities |

---

## Storage buckets

| Bucket / usage | Classification | Evidence |
| --- | --- | --- |
| `live-preview` | **Shared infrastructure** | CODEBASE: Studio generations + FS preview paths |
| Expert capture uploads | **SW-only** purpose | API handlers — exact bucket name in handler code not fully enumerated |
| Generated registry assets | **SW-only** metadata | URLs in `studio_asset_registry_*` |

**Risk:** Object keys may intermix if prefix discipline is inconsistent — **ownership unclear** without bucket listing.

---

## File paths (repo)

| Path | Classification |
| --- | --- |
| `src/studio-os-core/**` | SW-only source |
| `src/workspaces/frontal-slayer/**` | **Mixed** — SW workspace format, FS tenant content |
| `brand-bible/**` | FS-only content (may be referenced in SW seeds) |

---

## Metadata & relationships

| Data | Classification |
| --- | --- |
| Workspace org id `frontal-slayer` in seeds/manifest | **Mixed** — SW platform, FS brand id |
| Company HQ instances (`studio_company_hq_instances`) | SW schema — may reference FS org ids |
| Generated prompts in jobs/registry | SW-only rows |
| Agent/conversation histories | **Unclear** — module-local persistence + possible Supabase rows not fully mapped |

---

## Logs & analytics

| Data | Classification |
| --- | --- |
| Vercel function logs | **Shared infrastructure** |
| `studio_social_publish_log` | SW-only table |
| FS analytics | FS-only |
| Studio-specific analytics product | **Missing** independent |

---

## Coexistence summary

| Pattern | Present? |
| --- | --- |
| SW + FS rows in same table (non-studio table) | **Unlikely** for studio_* tables; **yes** for shared `auth.users` |
| SW tables in FS Supabase project | **Yes** |
| Same service role for API workers | **Yes** |
| Same storage project | **Yes** |

No data altered during this audit.
