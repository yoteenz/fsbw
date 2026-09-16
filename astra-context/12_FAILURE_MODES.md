# Failure Modes & Visual Drift (verified)

Do not exaggerate — these are documented in audits and sprint history.

---

## Primary failure class: Template / website drift

Symptoms called out in sprint brief and corrected in FT3.x:

| Symptom | Evidence |
|---------|----------|
| Hero + cards mid-band | `DesktopHomeReferenceLayout` — P0.E.2 convergence target; **superseded** on home by D01/M01 but pattern still in repo |
| Directory-style reader search | Removed FT3.2 → invoke field + orbit (`SITE00_ASTRAL_WORLD_P0E3_FT32_INTERACTION_LANGUAGE.md`) |
| Mall pricing grid | Removed → spatial kiosk hotspots + tray |
| CRM friend rows | Replaced with spatial presence groups |
| UI **on top of** world as generic sections | Mitigated via layered screen masters + `CanonicalScreenStage` — **risk remains** if new design reintroduces white cards/rails |
| Environment as **decorative background** only | Risk if CTAs don't feel **in** the space |
| Insufficient "entering a place" | Founder benchmark explicitly tests this |

---

## Reference vs implementation gaps (honest)

From `REFERENCE_FIDELITY.md`:

1. **Interim crops** — not standalone clean environment PNGs
2. **Typography** — approximate, not font-verified
3. **Micro-spacing** — ±4px at non-native viewports
4. **Meet My Friends** — on reference desktop mid-band; **not** direct on current D01 entry (only via Who's Here / nav)

---

## Governance failures to avoid

- Treating **PROTOTYPE_FIXTURE** as production business truth
- Auto-promoting **CREATIVE_EXPLORATION** to canon
- Copying **STALE** `DesktopHomeReferenceLayout` when D01/M01 + references are authority for entry

---

## Technical / product gaps (not visual)

| Gap | Status |
|-----|--------|
| Realtime presence | Not shipped — local state |
| Identity canon | 0 approved fields |
| WORLD formation | NOT FORMED |
| FAL portrait assets | Partial / pilot |

---

## What improved (for Astra context)

- Scene-first architecture (FT3.1)
- World-native interaction language (FT3.2)
- Layered replication screen masters (FT5.2B–D)
- Independent mobile authority

Use improvements as **direction**, not proof entry already feels like a AAA title screen — founder judgment still **AWAITING**.
