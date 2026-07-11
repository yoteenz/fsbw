# Studio OS Unified Onboarding Pack

Deterministic multi-capsule onboarding: one entry point, one reading order, one final report.

## Permanent URLs

| Route | Purpose |
|-------|---------|
| `https://fsbw.vercel.app/onboarding/latest` | Latest validated unified pack ZIP |
| `https://fsbw.vercel.app/onboarding` | Dashboard — version, capsules, validation, copy prompt |
| `https://fsbw.vercel.app/context/latest` | Individual Context Capsule (optional) |
| `https://fsbw.vercel.app/founder-intelligence/latest` | Individual Founder Intelligence (optional) |

## Package structure

```
StudioOS_OnboardingPack/
├── START_HERE.md
├── MASTER_MANIFEST.md
├── ONBOARDING_GUIDE.md
├── ONBOARDING_REPORT_TEMPLATE.md
├── ONBOARDING_PACK_VALIDATION.md
├── onboarding-pack.json
├── AI_Context_Capsule/
├── Founder_Intelligence_Capsule/
└── Studio_DNA_Capsule/          # only when validated and included
```

## Regenerate locally

```bash
npm run package:ai-context-capsule-zip
npm run package:studio-dna-capsule-zip
npm run package:founder-intelligence-capsule-zip
npm run package:onboarding-pack-zip
```

Prebuild runs all four in order. The onboarding pack **does not publish** unless Context and Founder Intelligence releases validate and FIC content-coverage checks pass.

## Authority rules

1. **Inside the unified pack:** `START_HERE.md` → `MASTER_MANIFEST.md` → capsule files → `ONBOARDING_REPORT_TEMPLATE.md`
2. **Standalone capsule ZIP:** that capsule's `README_FIRST.md` + `MANIFEST.md` remain authoritative
3. **Studio DNA:** optional until included in pack; not a validation failure when absent
4. **One report:** populate `ONBOARDING_REPORT_TEMPLATE.md` in original wording — do not copy blank instructional text

## Prior failure modes — test checklist (Phase 14)

Run each test in a **fresh AI conversation** with no prior Studio OS context. Attach only the unified pack from `/onboarding/latest`.

| ID | Failure mode | Pass criteria |
|----|--------------|---------------|
| A | Stops after inspecting archive contents | AI reads full MASTER_MANIFEST order before responding |
| B | Refuses because not all docs read | AI completes reading then produces report (no premature refusal) |
| C | Treats Studio DNA as mandatory when absent | AI notes DNA optional; continues with Context + FIC |
| D | Two separate onboarding processes | Single report covering both capsules; no per-capsule completion |
| E | Reproduces template verbatim | Report uses original findings; blank placeholders not copied as answers |
| F | Shallow repo-only assessment | Report includes Founder Intelligence sections (marketplace, workers, knowledge capture) |
| G | Begins solving before approval | No code, sprints, or architecture proposals; waits for founder approval |
| H | Invents implementation for conceptual systems | Civilization / full marketplace marked conceptual or planned with citations |

## Source files

| Path | Role |
|------|------|
| `onboarding-pack/ONBOARDING_GUIDE.md` | Static guide copied into pack |
| `onboarding-pack/ONBOARDING_REPORT_TEMPLATE.md` | Static 19-section template |
| `scripts/package-onboarding-pack-zip.mjs` | Generator, validation, FIC coverage |
| `scripts/sync-capsule-latest-vercel-routes.mjs` | Static rewrites + versioned Content-Disposition in vercel.json (prebuild) |
| `src/pages/onboarding/page.tsx` | Public hub |
| `src/studio-os-core/onboarding-pack-export/constants.ts` | `UNIFIED_ONBOARDING_PROMPT` |
