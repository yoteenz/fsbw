# Current Handoff — Active Sprint State

**Capsule:** StudioOS_ContextCapsule_v0.1  
**Last updated:** 2026-07-12  
**Git reference:** pending post-deploy SHA

---

## Current sprint

**P0 — Dispatch Office serverless bundle boundary repair**

**Status: In Progress — production canary verification pending.**

Repair ships pre-bundled `studio-os-server.bundle.js` so governed-generation routes no longer depend on untraced `api/` → `src/studio-os-core/` runtime imports. **Founder authenticated Layer 1 verification not complete.**

Creative Studio and Experience Engine **share the same runtime** at `/admin/studio/experience-lab`. Pre-handler bundle repair applies to **all four** Dispatch endpoints. Do not treat either surface as restored until canary + authenticated Layer 1 verify.

**Previous:** P0 Dispatch Office forensic + Creative Services roadmap (docs); Layer 1 repair `7a8869404` (handler hardening — did not fix pre-handler class).

---

## Current blocker

See `KNOWN_BLOCKERS.md` for full detail.

| ID | Blocker | Owner | Unblock |
|----|---------|-------|---------|
| **B0-PreHandler** | Dispatch Office `FUNCTION_INVOCATION_FAILED` pre-handler | Composer (deployed) + production probe | Canary returns JSON on all four endpoints |
| **B1-Layer1** | Layer 1 `signature-landmark` governed generation | Founder (device) | Mobile Safari + Chrome after B0 passes |
| **B2** | Diagnostic normal-tab verification | Founder (device) | https://fsbw.vercel.app/__studio-os-recovery |

---

## Current debugging status

| System | Status | Classification |
|--------|--------|----------------|
| Pre-handler bundle repair | Shipped (pending SHA) | **In Progress** |
| Dispatch canary (ephemeral) | Not verified post-deploy | **Unknown** |
| Handler JSON / traceId | Should execute after B0 fix | **Inference** |
| Layer 1 FAL path | Not verified authenticated | **Unknown** |
| Incident resolved | No | **Documented Fact** |

---

## Primary canary (post-deploy)

```
POST https://fsbw.vercel.app/api/admin/experience-lab-ephemeral-authorization
```

**Pass:** `content-type: application/json` — not plain-text `FUNCTION_INVOCATION_FAILED`.

**Then probe:** `studio-builder-generate`, `studio-foundry-generate`, `studio-generate-asset`.

---

## Authenticated verification (after canary)

```
https://fsbw.vercel.app/admin/studio/experience-lab?compilerDiag=1
```

Mobile Safari + Chrome — Creative Studio **and** Experience Engine. Required for incident resolution; not part of this deploy gate alone.

---

## Forensic references

- `docs/studio-os/forensics/DISPATCH_OFFICE_PREHANDLER_FORENSIC.md`
- `docs/studio-os/creative-services/CREATIVE_SERVICES_ROADMAP.md` (Planned — not in scope)
