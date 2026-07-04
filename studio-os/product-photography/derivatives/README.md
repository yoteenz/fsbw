# Product Photography — Derivatives

Empty folder architecture for derivative assets derived from approved hero portraits. See `docs/frontal-slayer/photography-derivative-engine/`.

## Structure

```
derivatives/
  signature-collection/
    {unitSlug}/
      {derivativeId}/
  bundles/          # future-ready placeholder
  closures/
  frontals/
  accessories/
```

Assets are **not generated** in Milestone 21 — folders only. Slots are prepared in admin when a hero portrait is approved.

## Trigger

Approve hero in Photography Bible → `prepareDerivativesOnHeroApproval()` → 18 slots with status `slot-prepared`.
