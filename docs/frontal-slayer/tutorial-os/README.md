# Onboarding Tutorial — The Mansion Tour

Interactive guided learning system for Frontal Slayer customers and studio os admins. The **Frontal Slayer Concierge** personality guides the experience; the product name is **Onboarding Tutorial**.

## Customer experience

- **Product label:** Onboarding Tutorial
- **Tour name:** The Mansion Tour (18 steps)
- **Philosophy:** Page → Feature → Widget → Action (Apple-style drill-down)

Optional welcome prompt on first visit (~5 min). Not forced — **Start Tour**, **Maybe Later**, or **Skip**.

Access points:

- First-visit welcome modal
- Menu toggle → **Tools** → **ONBOARDING TUTORIAL** (reopens the wizard)
- Menu toggle → **Tools** → **TUTORIAL SEARCH**
- Fixed **?** button on supported pages — **Learn this page** (opens page help tour)
- Account dashboard — **Take The Mansion Tour**

## V2 architecture

| Path | Role |
|------|------|
| `src/tutorial-os/v2/schema.ts` | Tour → Page → Feature → Widget → Action hierarchy |
| `src/tutorial-os/v2/compiler.ts` | Compiles V2 defs to flat wizard steps |
| `src/tutorial-os/v2/pageRegistry.ts` | Supported pages + help tour mapping |
| `src/tutorial-os/v2/searchIndex.ts` | Tutorial search + suggested next tour |
| `src/tutorial-os/v2/progressHelpers.ts` | Page/feature/widget completion tracking |
| `src/tutorial-os/tours/v2/mansionTourV2.ts` | 18-step Mansion Tour with feature cards |
| `src/tutorial-os/tours/v2/vouchersWalkthrough.ts` | 6-step nested Voucher walkthrough |
| `src/tutorial-os/tours/v2/expandedTours.ts` | Wishlist (5), Checkout (9), Rewards (12), BAW (25) |
| `src/tutorial-os/TutorialOsContext.tsx` | Nested tour stack, search, help mode, progress |
| `src/tutorial-os/components/TutorialFeatureCards.tsx` | SHOW ME feature drill-down cards |
| `src/tutorial-os/components/TutorialSearchModal.tsx` | Search modal |
| `src/tutorial-os/components/TutorialPageHelpButton.tsx` | Per-page ? help |

Nested tours: finishing a child walkthrough (e.g. Vouchers) returns to the parent step (e.g. Mansion Tour Rewards).

## Progress (V2)

- **Store version:** 2
- **Tracks:** completed pages, features, widgets, tours, recently learned, suggested next tutorial
- **Guests:** `localStorage` key `fsTutorialProgress_v1`
- **Signed-in:** `PUT/GET /api/tutorial/progress` → Supabase `tutorial_progress` table

## Admin

**studio os → Onboarding Tutorial** at `/admin/studio/tutorial-os`

Sections: Tours, Pages, Features, Widgets, Animations, Hotspots, Search Index, Completion Analytics, User Progress, Missing Targets, Route Validation, Copy Library, Preview Tour.

Preview URL: `/home/shop?tutorialPreview=mansion-tour`

## Hotspot selectors

Steps define `targetSelector` (e.g. `[data-tutorial-target="voucher-history-trigger"]`). Missing targets log in dev and show the step without breaking.

## Premium / sign-in bypass (view-only tour)

While the welcome prompt or an active tour step is showing, **`isTutorialOsConciergeBypassActive()`** treats the session as premium for gate checks and allows **Account** routes without sign-in.
