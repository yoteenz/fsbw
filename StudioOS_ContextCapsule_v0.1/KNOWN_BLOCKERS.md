# KNOWN BLOCKERS — Do Not Violate

**Last updated:** 2026-07-10  
**Authority:** Overrides feature work, compile repair, and optimistic assumptions  
**Git reference:** `3b8fb4fa7`

---

## Gate rule

**Do not resume** Experience Lab compile repair, Layer 1 auth fixes, or Creative Direction Studio feature work until:

1. **B2** — founder verifies diagnostic routes in **normal** mobile tabs  
2. **B1** — approved repair sprint exists for Layer 1 auth  

Forensic and documentation sprints are allowed. Feature resume is not.

---

## B1 — Layer 1 AUTH_REQUIRED (P0)

| Field | Detail |
|-------|--------|
| **ID** | B1 |
| **Symptom** | Experience Lab compile reaches Layer 1 (`signature-landmark`) then fails |
| **UI state** | `FAILED_AT_LAYER_1` — "LANDMARK GENERATION FAILED" (not shell retry) |
| **Proven root cause** | Shell succeeds via **canvas fallback**; Layer 1 uses governed generation API only → server returns **`AUTH_REQUIRED`** because client sends no `productionAuthorizationId` and `legacyCompatEnabled()` is false in production |
| **Owner** | Composer (future approved sprint) |
| **Unblock options** | Ephemeral `productionAuthorizationId` for validation mode **OR** scoped legacy compat for Experience Lab drafts (founder policy decision) |
| **Forensic status** | ✅ Complete (`506d77169`, `layer1-forensic.ts`, `?compilerDiag=1`) |
| **Repair status** | ❌ Not started |

### Do not

- Add canvas fallback for Layer 1 to mask auth failure without governance review  
- Silent auth bypass on governed generation routes  
- Treat "shell loaded" as compile success  
- Resume full compile pipeline work before B2 verified + B1 sprint approved  

### Verify compile diagnostic

```
?compilerDiag=1
```

---

## B2 — Diagnostic normal-tab verification (P0)

| Field | Detail |
|-------|--------|
| **ID** | B2 |
| **Symptom** | `/__studio-os-*` routes worked in private/incognito but failed in normal tabs |
| **Fix shipped** | Pre-main probe + split entry (`ef969cb7d`) — diagnostic routes bypass `main-app.tsx` |
| **Owner** | Founder (device verification) |
| **Unblock** | Confirm all diagnostic routes load on **iOS Safari / Chrome normal tabs** (not private) |
| **If stale cache** | Use recovery page first |

### Recovery URL

```
/__studio-os-recovery
```

### Other diagnostic URLs

```
/__studio-os-flight-recorder
```

```
/__studio-os-live-runtime
```

```
/__studio-os-session-report
```

---

## Resolved (context — not active blockers)

| Item | Commit | Notes |
|------|--------|-------|
| `studio-world-atlas` package missing from registry | `03726eaf9` | Fixed — was failing before Layer 1 |
| Misleading "Retry Shell Layer" UI | `506d77169` | Fixed — shows landmark failure |
| Vercel build TS2322 in diagnostic test | `3b8fb4fa7` | Fixed — window stub |

---

## Risk matrix

| Risk | Mitigation |
|------|------------|
| Stale asset cache after deploy | Build ID meta + `/__studio-os-recovery` |
| Oversized `genesis_v1` breaks boot | Quarantine on diagnostic entry |
| Multiple Vercel deploys per task | One commit + one push per founder request |
| ChatGPT contradicts canon | Glossary + changelog + this file |
| Canvas shell fallback masks auth gap | Do not extend fallback to Landmark |

---

*If blockers in this file conflict with chat memory, this file wins.*
