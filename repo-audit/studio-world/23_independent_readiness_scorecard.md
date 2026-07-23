# Studio World — Independent Readiness Scorecard

**Scale:** 0 nonexistent · 1 fully FS-dependent · 2 heavily coupled · 3 partially separable · 4 mostly independent · 5 independently operable  

Scores are **conservative** with repository evidence.

---

| Category | Score | Evidence |
| --- | --- | --- |
| **Product identity** | **2** | Documented as Studio World in canon; routes live under FS `/admin/studio` (`03_routes.md`, `15_system_boundary.md`) |
| **Code ownership** | **3** | Large SW-only trees (`studio-os-core`, `components/admin/studio`) in monorepo (`02_folder_tree.md`) |
| **Application shell** | **1** | Single `App.tsx` (`15_system_boundary.md` COUPLED-CRITICAL) |
| **Routes** | **2** | 312 studio route declarations but FS-hosted prefix (`03_routes.md`) |
| **UI system** | **3** | Dedicated Studio layouts/theme; shared Tailwind/host (`21_visual_identity_boundary.md`) |
| **Business logic** | **4** | Concentrated in `studio-os-core` (~3177 files) (`05_systems.md`) |
| **AI systems** | **3** | Own jobs/APIs; shared FAL env and FS parity boundary (`08_agents.md`, KNOWN_BLOCKERS) |
| **Data ownership** | **2** | SW tables exist; shared Supabase project (`18_data_separation_inventory.md`) |
| **Authentication** | **1** | Requires FS AdminGuard + shared Auth (`19_identity_and_auth_boundary.md`) |
| **Backend services** | **3** | Dedicated API files; FS Vercel project (`20_infrastructure_boundary.md`) |
| **Assets** | **3** | `public/studio-os`, registry; shared `live-preview` bucket |
| **Infrastructure** | **1** | Monorepo, one deploy, one Supabase (`20_infrastructure_boundary.md`) |
| **Deployment** | **1** | No separate Studio deploy config |
| **Domain readiness** | **0** | No independent domain in repo |
| **Observability** | **2** | Debug/immune APIs; no separate monitoring product |
| **Testing** | **2** | Not separately inventoried; shared repo |
| **Documentation** | **4** | Extensive `docs/studio-os` + audit (`01–14`) |
| **Security** | **2** | RLS on studio tables; shared auth/admin model |
| **Governance** | **3** | Headquarters principles, master-spec; mixed FS tenant in manifest |

**Approximate mean:** ~2.2 / 5 — **heavily coupled, not independently operable**.

---

## Cleanly separable (evidence)

| Asset | Score hint | Reference |
| --- | --- | --- |
| `docs/studio-os/**`, STUDIO_OS_BIBLE | 4–5 docs-only | `02_folder_tree.md` |
| `StudioOS_ContextCapsule_v0.1/` | 4 | Capsule |
| `studio_*` SQL migrations (logical schema) | 4 logical | `07_database.md` |
| `public/studio-os/` static manifests | 4 | `10_assets.md` |
| Studio-only API handler **source** | 3–4 files | `api/admin/studio-*` |

---

## Unclear ownership (Founder decisions)

| Area | Reference |
| --- | --- |
| `motherboard/` mixed memory | `15_system_boundary.md` UNCLEAR |
| `platform-stabilization/` | SHARED-TEMPORARY |
| `live-preview` bucket object ownership | `18_data_separation_inventory.md` |
| Future Studio end-customer auth | `19_identity_and_auth_boundary.md` |
| Visual accent red vs new Studio palette | `21_visual_identity_boundary.md` |
| Legal/policy for Studio product | `22_separation_risk_register.md` R30 |

---

# Final conclusion (separation addendum)

### 1. Could Studio World operate independently today?

**No.** It requires the Frontal Slayer monorepo build, FS `/admin` authentication shell, shared Supabase project, shared Vercel deployment, and shared environment secrets (`19`, `20`, scorecard auth/infrastructure/deployment/domain 0–1).

### 2. Largest current blockers to independence

1. **Monolithic application shell and deploy** (R1, R14)  
2. **Shared Supabase auth + database + storage** (R3, R9)  
3. **Studio nested inside FS AdminGuard / admin role model** (R2)  
4. **Import graph and FS pages depending on `studio-os-core`** (R4, R5, R22)  
5. **Governed generation worker + shared AI/storage pipeline** (R6, R28)

### 3. Systems already cleanly separable

Logical **Studio schema** (`studio_*` migrations), **documentation canon**, **static `public/studio-os` manifests**, and the majority of **`src/studio-os-core` + Studio UI source** as copy/export candidates — still non-operational without new shell/infra.

### 4. Unclear ownership

`motherboard/`, `platform-stabilization/`, shared hooks folder, `live-preview` object prefixes, legal coverage for Studio as product, future Studio customer identity model.

### 5. Founder decisions required before migration planning

- Independent domain and auth product for Studio World vs continued founder-only ops  
- Fate of FS pages importing `studio-os-core` (vision, onboarding, founder-intelligence)  
- Database split vs shared-auth provider strategy  
- Visual identity: retain FS red or new Studio palette  
- Whether `frontal-slayer` workspace remains a **tenant** on Studio platform or moves out  
- Billing/FAL quota ownership  

### 6. Does repo structure hide critical coupling?

**Yes.** Coupling is easy to under-estimate because Studio presents as `/admin/studio` “inside” FS, while **~3k core files** and **FS consumer imports** create **bidirectional** dependency (`15_system_boundary.md`, `16_separation_dependency_map.md`).

### 7. Is the inventory complete enough to begin formal separation-planning phase?

**Yes**, for **planning** — not for execution. This addendum (`15–23`) plus base inventory (`01–14`) documents product boundary, dependencies, data, auth, infra, visual, risks, and readiness. **Separation and Migration Program** remains **out of scope** until Founder approves the inventory.

---

*Do not create the separation plan in this audit phase.*
