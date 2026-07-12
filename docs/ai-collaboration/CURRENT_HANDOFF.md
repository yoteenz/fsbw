# Current Handoff — Active Sprint State

**Last updated:** 2026-07-12  
**Update this file** at every sprint boundary, P0 change, or architecture decision.

---

## Current sprint

**P0 Isolated Layer Generation Repair — SHIPPED (pending founder verification)**

Repair `LANDMARK_VALIDATION_FAILED` / `QUALITY_REGENERATE_REQUIRED` on `signature-landmark` and `furniture-objects` — outputs were full-scene rerenders instead of isolated mountable plates.

**Docs:** `docs/studio-os/creative-production/ISOLATED_LAYER_GENERATION_CONTRACT.md` · `docs/studio-os/incidents/FULL_SCENE_RERENDER_LAYER_FAILURE.md`

**Previous shipped:** CD Studio stack auth (`e612bc4ab`) · Immune System schema drift (`f944066ab`)

---

## Current blocker

| ID | Blocker | Owner | Unblock |
|----|---------|-------|---------|
| **B1-Layer** | Founder verification — Experience Lab must advance beyond Layer 1 with isolated landmark/furniture assets | Founder (device) | Run full compile on mobile after deploy; confirm quality guard accepts isolated PNG plates |
| **B2** | Diagnostic routes — normal-tab verification pending | Founder (device) | Confirm `/__studio-os-*` routes in iOS Safari/Chrome normal tabs |

**Documented fact:** Shell pipeline succeeded for `run-1783892114155-bnqd8w`; Layer 1 quality validation failed on full-scene rerender outputs.

---

## Current debugging status

| System | Status | Notes |
|--------|--------|-------|
| Shell foundation pipeline | ✅ Healthy | 202 · register · persist · verify |
| Isolated layer contract | ✅ Shipped | No shell img2img for landmark/furniture |
| Quality guard (frame coverage + alpha + shell similarity) | ✅ Shipped | Rejects full-scene rerenders |
| Auto-regeneration loop (max 2) | ✅ Shipped | Shell preserved |
| UI truth (landmark vs shell failure) | ✅ Shipped | No misleading Retry Shell for layer-quality failures |
| Experience Lab Layer 1+ compile | ⏳ Pending | Founder verification after deploy |

---

## Latest architectural decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-07-12 | Isolated object layers use perspective-metadata-only — no shell URL to FAL | img2img shell reference encouraged full-scene repaint |
| 2026-07-12 | PNG required for `signature-landmark` + `furniture-objects` | Alpha transparency required for CSS compositing |
| 2026-07-12 | Max 2 automatic isolation regeneration attempts | Preserve shell; reject only failed layer |
| 2026-07-12 | Keep FAL `nano-banana-pro/edit` with text-only path for isolated layers | Governed route; no ungoverned side path |

---

## Recently completed work

| Commit / deliverable | Summary |
|---------------------|---------|
| This sprint | Isolated layer contract, prompts, quality guard, regeneration loop, UI truth, tests, docs |
| `e612bc4ab` | CD Studio ephemeral stack authorization |
| `f944066ab` | Immune System schema drift self-healing |

---

## Immediate next priorities

1. **Founder:** Verify Experience Lab compile advances past Layer 1 on mobile
2. **Founder:** If two regeneration attempts fail, review provider/model routing
3. **Composer (if needed):** Governed model route change for isolated layers if FAL text-only remains unreliable

---

## Known risks

| Risk | Mitigation |
|------|------------|
| FAL text-only may still produce opaque plates | Quality guard rejects; escalation after 2 attempts |
| Provider cannot natively emit alpha PNG | Document limitation; recommend governed model route |
