# AIO PUBLIC WEBSITE — design review evidence

Sprint **P0.AIO.COMPLETE-PRODUCT-VISUAL-CONVERGENCE.INTERNAL-OFFICE-AND-PUBLIC-WEBSITE1** (2026-10-09). Design review only: nothing here is deployed, and the live public site is unchanged.

## What this is

ALL IN ONE ENTERPRISES INC.'s public website, designed in the founder's brand language. It is dark and cinematic: obsidian, charcoal, signature gold, champagne and platinum, with truck photography.

- **Homepage.** Held to **panel 04, "WEBSITE HOMEPAGE EXPRESSION", of the founder brand DNA board** (SITE00 `4af8116c`). This is the only founder image of the public homepage found in either repository or its history.
- **Service family.** Held to the **approved IFTA public page**.
- **Page tree.** The whole recovered tree is designed: 92 pages, recovered from `src/routes/AioCoreRoutes.tsx` and the canonical service catalog. Each catalog service has a page showing its real status from the activation matrices.

The following are not shown, because none are approved or verified:
- prices
- client counts
- success rates
- testimonials

## Contents

- `boards/`
  - `match-home.jpg`: panel 04 beside the homepage's first screen, with what matches and what differs.
  - `match-family.jpg`: the approved IFTA public page beside the service family.
  - `home-sizes.jpg`: the homepage at 390 · 834 · 1440 · 2560.
  - `family.jpg`: the six service-family jobs: hub, service, plans, partner, paused, approved.
  - `remaining.jpg`: every other designed page.
- `screens/`: the first screen of every page except the generated service pages, plus five representative service pages, at four sizes. Written by QA.
- `thumbs/`: the review's card images.
- `qa-summary.json`: every check the QA ran and its result.

## Tools (fsbw `all-in-one-enterprises/design-authority/aio-public/`)

```
node design-authority/aio-public/build.mjs <dist>    # index.html (review artifact) · local.html · site.html (the site alone) · assets
node design-authority/aio-public/qa.mjs <dist>       # → screens/ + qa-summary.json
node design-authority/aio-public/boards.mjs <dist>   # → boards/ + thumbs/ (then build again so the review lists the thumbs)
```

The build bundles the live sources with esbuild:
- the catalog
- the discovery categories and need options
- both activation matrices
- `divisionMeta`
- the homepage pathways and roadmap stages
- the Start Your Business journey
- the bookkeeping plan features
- the FleetCare and DriverLink disclosures

Prices are cut before anything reaches the page, and the build fails if a `$` figure does.

## Not found, and not substituted

The following were not found in either repository and nothing was substituted for them:
- The 2026-08 desktop homepage mock.
- The 13-screen founder mobile reference.
- The Page Story & Moodboard. These references are described in fsbw docs. fsbw history has a gap from 2026-04-14 to 2026-08-26.
- A branded black-truck photograph like the one in panel 04.
- Approved prices.
- Verified contact details.
- A licence for Monument Extended.
