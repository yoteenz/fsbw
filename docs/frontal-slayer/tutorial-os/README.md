# Tutorial OS — The Mansion Tour

Interactive concierge walkthrough system for Frontal Slayer customers and StudioOS admins.

## Customer experience

- **Module:** Tutorial OS
- **Customer name:** The Mansion Tour
- **Label:** Onboarding Tutorial

Optional welcome prompt on first visit (~3 min). Not forced — **Start Tour**, **Maybe Later**, or **Skip**.

Access points:

- First-visit welcome modal
- Floating **OT** onboarding FAB (bottom-right)
- Account dashboard — **Take The Mansion Tour**

## Architecture

| Path | Role |
|------|------|
| `src/tutorial-os/types.ts` | Step + tour schema |
| `src/tutorial-os/registry.ts` | Tour registry |
| `src/tutorial-os/tours/mansionTour.ts` | Seeded 10-step Mansion Tour |
| `src/tutorial-os/tours/placeholders.ts` | Empty shells for future tours |
| `src/tutorial-os/TutorialOsContext.tsx` | Provider, navigation, progress |
| `src/tutorial-os/progressStorage.ts` | localStorage + merge helpers |
| `src/tutorial-os/targetResolver.ts` | Spotlight + missing-target logging |

Placeholder tours (architecture only): Build-A-Wig, Rewards, Lounge TV, Hairstyle Analysis, Membership, Account, Checkout.

## Progress

- **Guests:** `localStorage` key `fsTutorialProgress_v1`
- **Signed-in:** `PUT/GET /api/tutorial/progress` → Supabase `tutorial_progress` table

Migration: `supabase/migrations/20260704180000_tutorial_progress.sql`

## Admin

**StudioOS → Tutorial OS** at `/admin/studio/tutorial-os`

Sections: Tours, Steps, Hotspots, Completion Analytics, Missing Targets, Preview Tour.

Preview URL: `/home/shop?tutorialPreview=mansion-tour`

## Achievements (placeholders)

- Mansion Tour → Explorer Badge
- Build-A-Wig Tour → Builder Badge
- Rewards Tour → Collector Badge

No live reward issuance yet — stored in `earnedAchievementIds` locally / DB.

## Hotspot selectors

Steps may define `targetSelector` (e.g. `[data-tutorial-target="nav-cart"]`). Missing targets log in dev and show the step without breaking.

## Premium / sign-in bypass (view-only tour)

While the welcome prompt or an active tour step is showing, **`isTutorialOsConciergeBypassActive()`** treats the session as premium for gate checks and allows **Account** routes without sign-in — so guests can preview Lounge TV, Rewards, Account, and premium Build-A-Wig steps without upgrade modals. Bypass clears when the tour ends or is skipped.
