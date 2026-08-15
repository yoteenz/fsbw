# All In One — Extraction Plan

Goal: Move `src/all-in-one/` into a **standalone repository** with minimal rewrite.

---

## Files / directories to extract

Copy entire tree:

```
src/all-in-one/          → src/ (or keep src/all-in-one/ in new repo)
  intake/                → Sprint 02 Smart Intake (config-driven)
  roadmap/               → Sprint 02 mock recommendation engine
  repositories/          → Persistence abstractions (LocalDemo* → Supabase* later)
  storage/demoStorage.ts → localStorage keys + reset
  data/services.ts       → Service catalog + bundles
  data/mockFactoring.ts
  services/factoring/
  pages/GetStartedPage.tsx, RoadmapResultsPage.tsx, ServicePlanPage.tsx, …
  pages/FactoringPage.tsx, FactoringPortalPage.tsx
  components/AIOFactoring*.tsx, AIODebugBanner.tsx, IntakeQuestionField.tsx, …
docs/all-in-one/         → docs/
```

Do **not** copy Frontal Slayer-specific paths (`src/pages/`, `src/components/`, `motherboard/`, etc.).

---

## Dependencies to copy / install

New repo `package.json` minimum:

- `react`, `react-dom`, `react-router-dom`
- `typescript`, `vite`, `@vitejs/plugin-react`
- Optional: same versions as host for consistency

Replace host-only imports:

| Current | After extraction |
|---------|------------------|
| `lazyWithRetry` from `../../utils/lazyWithRetry` | Local util or standard `React.lazy` |
| `StudioDebugRoutes` registration | Own `App.tsx` with routes at `/` not `/debug/all-in-one` |

---

## Configuration changes

Update `src/all-in-one/config/appConfig.ts`:

```ts
routes: {
  base: '/',           // was /debug/all-in-one
  portal: '/portal',
  clientLogin: '/portal',
}
```

Update `aioPaths` helper accordingly.

Environment variables (future):

- `VITE_AIO_API_URL`
- `VITE_AIO_SUPABASE_URL` (new project — **not** Frontal Slayer `hyycomvcaqxxvyrfupes`)
- `VITE_AIO_CONTACT_PHONE`
- `VITE_AIO_SITE_URL`

---

## Routing changes

| Debug (host) | Production (standalone) |
|--------------|-------------------------|
| `/debug/all-in-one` | `/` |
| `/debug/all-in-one/portal/factoring` | `/portal/factoring` |
| `/debug/all-in-one/services/factoring` | `/services/factoring` |
| `/debug/all-in-one/services/...` | `/services/...` |

Remove registration from `StudioDebugRoutes.tsx` and `studio-institute-paths.ts` in host repo after cutover.

---

## Supabase separation

- Create **new** Supabase project for All In One customer data
- Do **not** migrate into Frontal Slayer production DB
- Apply migrations only to All In One project when backend sprints begin

---

## Domain & Cloudflare

1. Register production domain (e.g. `allinoneenterprises.com`)
2. Deploy standalone Vercel/Cloudflare Pages project
3. Point DNS + SSL
4. Retire `/debug/all-in-one` route on Frontal Slayer host

---

## Asset migration

1. Replace `appConfig.assets.heroImage` URL with hosted CDN asset
2. Drop in final logo SVG/PNG at `public/assets/logo.svg`
3. Set `appConfig.assets.logoSlot`

---

## Build / deployment

Standalone Vite app:

```bash
npm run build
# deploy dist/ to Vercel or Cloudflare Pages
```

No dependency on Frontal Slayer `vercel.json` or `[sync-only]` commit flow.

---

## Must NOT travel from Frontal Slayer

- Supabase project `hyycomvcaqxxvyrfupes` credentials
- Frontal Slayer auth (`adminAuth`, Supabase session)
- Storefront components, design system (`src/design-system/`), FSMS
- Admin routes, Studio OS modules
- Expert capture `/expert-capture/all-in-one-permitting` (separate Studio OS artifact — evaluate separately)

---

## Extraction checklist

- [ ] New GitHub repository created
- [ ] `appConfig` routes updated to production paths
- [ ] `lazyWithRetry` decoupled or inlined
- [ ] Standalone `App.tsx` + router
- [ ] New Supabase project (when backend needed)
- [ ] Production domain + deploy
- [ ] Remove debug route from Frontal Slayer host
- [ ] Verify zero Frontal Slayer visual/code coupling
