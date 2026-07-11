# Historical Context

Problems solved, false starts, and major investigations. **Why** solutions were chosen.

---

## Experience Lab / World Compiler (2026-07)

**Problem:** Validation compile failed at Signature Landmark™ (`AUTH_REQUIRED`, `GENERATION_FAILED`).  
**False starts:** Hardcoded ephemeral auth ID; blocking pre-pipeline auth API that crashed on Vercel (`FUNCTION_INVOCATION_FAILED`).  
**Solution path:** Server-issued lazy ephemeral auth on `studio-builder-generate`; runtime no longer blocks on separate auth endpoint.  
**Lesson:** Layer 0 shell has canvas fallback; Layer 1+ does not — auth must reach governed FAL.  
**Maturity:** Approved

---

## Normal tab vs incognito (2026-07)

**Problem:** Routes work in private tabs but fail in normal tabs after deploys.  
**Cause:** Stale `localStorage` / `sessionStorage`, stuck `data-loading-screen`, bisection flags.  
**Solution:** `runBootHygiene()` on every boot; `/__studio-os-recovery` route; post-load-render-guard on all routes.  
**Maturity:** Approved

---

## Vercel capsule deploy failure (~1GB)

**Problem:** Serverless capsule download routes bundled entire `public/`.  
**Solution:** Static ZIP + `sync-capsule-latest-vercel-routes.mjs`; deleted `api/capsules/*`.  
**Maturity:** Approved

---

## Invite Manager owner password (2026-07)

**Problem:** Phone could not unlock dashboard without Vercel env key.  
**Solution:** Founder password → SHA-256 → `app_config` + localStorage; server verification on new devices.  
**Follow-up bug:** Stale local hash blocked server verify — fixed unlock order.  
**Maturity:** Approved

---

## Build-a-Wig evolution

**Problem:** Single wig commerce site needed Studio OS R&D without forked deployment.  
**Solution:** Same repo, same Vercel project (`fsbw.vercel.app`); Studio routes under `/admin/studio/*`, institute under `/studio-institute/*`.  
**Maturity:** Working

---

## Marketplace evolution

**Problem:** Risk of "digital storefront" thinking flattening civilization vision.  
**Solution:** Document evolution in Founder Intelligence + this timeline; commission, licensing, workers as first-class.  
**Maturity:** Approved

---
**Last Updated:** 2026-07-11  
**Confidence Level:** High  
**Source:** Collaboration Intelligence Capsule sprint v1.0  
**Status:** Approved  
**Version:** 1.0.0  
**Related Documents:** IMPORTANT_CONVERSATIONS.md, EVOLUTION_TIMELINE.md  
**Future Questions:** Link investigations to Black Box compile run IDs?
