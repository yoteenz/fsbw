# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-12  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Model Registry + Brand-Grounded Isolated Asset Routing**

**Status: Complete (code shipped) — founder mobile verification pending.**

Promotes `fal-ai/nano-banana-2` as production default for isolated Scene Stack assets. Environment shell remains `fal-ai/nano-banana-pro/edit`. Configuration-driven Model Registry (`layer-model-routing.v2`) + Brand Asset Grounding with exact Frontal Slayer marble (`/assets/marble-half.png`). Material fidelity validation in verified pipeline. Evidence panel expanded.

**Previous:** Verified Asset Production Pipeline (`8cb795b1a`).

---

## Current blocker

| ID | Blocker | Status |
|----|---------|--------|
| **B1-Isolated** | Brand-grounded NB2 isolated generation | **In Progress** — code shipped; founder device proof pending |
| **B1-Layer1** | Governed generation Layer 1 | **In Progress** — async + immune repair shipped; founder device verification pending |

---

## Founder workflow

```
/admin/studio/experience-lab?compilerDiag=1
```

1. Run validation compile
2. Verify evidence panel shows: model route, NB2, brand marble reference, material verdict
3. Confirm no shell image in isolated layer references
4. Layer 1 landmark should use NB2 edit with brand marble when materials required

**Rollback:** set isolated route `rolloutState: deprecated` on `nano-banana-2-isolated` in `model-registry/routes.ts` — no call-site rewrites.

---

## References

- `docs/studio-os/creative-production/MODEL_REGISTRY.md`
- `docs/studio-os/creative-production/BRAND_ASSET_GROUNDING_STANDARD.md`
- `docs/studio-os/creative-production/BRAND_MATERIAL_FIDELITY_POLICY.md`
- `docs/studio-os/creative-production/NANO_BANANA_2_ISOLATED_ASSET_ROUTE.md`
- `docs/studio-os/creative-production/VERIFIED_ASSET_PRODUCTION_PIPELINE.md`
