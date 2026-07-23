# Studio World — Identity & Auth Boundary

Facts only — can Studio World authenticate without Frontal Slayer **today**?

**Answer:** **No** for production Studio HQ paths under `/admin/studio*`. Studio routes are nested inside FS **`AdminGuard`**, which requires FS admin sign-in flow.

---

## Authentication provider

| Item | Observation |
| --- | --- |
| Provider | Supabase Auth (shared) — `.env.example` `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` |
| Sign-in UI | FS routes `/sign-in` with `returnTo` — `AdminGuard.tsx` |
| Session storage | Browser session shared with customer FS account surfaces |

---

## User tables & profiles

| Item | Observation |
| --- | --- |
| Auth users | Single pool |
| FS profile sync | FS admin APIs (e.g. sync-profile) — **FS-owned**; Studio membership separate table |
| `studio_os_org_memberships` | Studio org access — **SW-owned table**, shared user ids |

---

## Roles & admin privileges

| Mechanism | Scope | Evidence |
| --- | --- | --- |
| `canAccessAdminPages()` | All `/admin/*` including Studio | `adminAuth` + `AdminGuard` |
| `StudioAdministrationGuard` | `/admin/studio-os/*` portfolio | Owner-only paths |
| `StudioWorkspaceGuard` | Workspace shell routes | |
| `isStudioWorldAdminEmail()` | Server canonical generation | `api/_lib/studioWorldAdminAccess.ts` — founder + env emails |
| `isStudioWorldAdmin()` (client) | Nav visibility | `adminStudioNavigation.ts` + core |

**Studio World admin** is a **subset** of FS admin session plus additional server/email gates — not a separate auth product.

---

## Route protection

```
/sign-in (FS)
  → AdminGuard (FS admin role)
    → AdminStudioWorkspaceGuard (workspace bootstrap)
      → StudioAdministrationGuard (portfolio)
        → StudioWorkspaceGuard (workspace id)
          → Studio department pages
```

Public **institute** paths (`/studio-institute/*`) on `StudioDebugRoutes` may bypass AdminGuard — **partially separate** entry; still same Supabase if authenticated elsewhere.

---

## Organization / workspace concepts

| Concept | Owner |
| --- | --- |
| Workspace registry | SW — `src/workspaces/`, bootstrap utils |
| `frontal-slayer` workspace | FS tenant inside SW model |
| Organization context | SW — `OrganizationContextProvider` |
| Portfolio (multi-workspace) | SW — Studio Administration |

---

## Founder access

| Gate | Evidence |
| --- | --- |
| Hard-coded founder email in `studioWorldAdminAccess.ts` | Server canonical ops |
| FS admin role | Client AdminGuard |

Same human may match both; systems are **not independent**.

---

## Internal staff vs future Studio customers

| Audience | Today |
| --- | --- |
| FS admin + founder | Primary Studio HQ users |
| Future Studio World customers (non-FS) | **No separate auth product documented in code** |
| Expert capture invitees | Token/invite flows — partial separate UX |

---

## Session handling

| Item | Observation |
| --- | --- |
| Token access | `getAccessToken()` from shared `utils/api` |
| Membership API timeout | `AdminStudioWorkspaceGuard` — 2s race |
| Workspace bootstrap timeout | 15s |

---

## Independence assessment

| Question | Factual answer |
| --- | --- |
| Can Studio authenticate users without FS sign-in pages? | **No** for main HQ (uses FS `/sign-in`) |
| Can Studio authorize without `canAccessAdminPages`? | **No** for `/admin/studio` tree |
| Can institute flows work standalone? | **Partial** — separate routes; shared auth stack if logged in |
| Separate Studio user table | **No** — uses auth.users + studio_os_org_memberships |

---

## Unresolved (Founder review)

| Question |
| --- |
| Should future Studio customers share zero identity with FS customers? |
| Are FS admins the only Studio users in perpetuity? |
| Portfolio owner env vars vs formal RBAC product |
