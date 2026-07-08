# Future Roadmap — Foundational Experience Systems™

**Version:** 1.0.0  
**Status:** Forward-looking  
**Prerequisite:** Golden Build mobile stability confirmed

---

## v1.0 (Current — Docs Only)

| Deliverable | Status |
|-------------|--------|
| Five foundational systems canon | ✓ Documented |
| CDS pilot mapping | ✓ |
| Inheritance law | ✓ |
| Cross-refs to alpha runtime | ✓ |
| Implementation | Not in scope until stability gate |

---

## v1.1 — Lightweight Arrival (Post-Stability)

**Gate:** iPhone Safari scroll · tap · generate without freeze

| Feature | Implementation |
|---------|----------------|
| Departure fade overlay | CSS opacity transition · 400ms |
| Glide feel | CSS transform translate · no 3D |
| Interaction lock | `arrivalComplete` flag · 2.5s minimum |
| Orb greeting on unlock | Existing orb runtime copy |
| Skip on same-session return | Session token |

No audio · no particles · no camera system.

---

## v1.2 — Lightweight Idle Life

| Feature | Implementation |
|---------|----------------|
| Orb breath | Single CSS keyframe · `prefers-reduced-motion` off |
| Queue pulse when generating | Static indicator — no animation loop on mobile |
| Reduced motion tier | Auto-detect |

---

## v1.3 — Persistence Hardening

| Feature | Implementation |
|---------|----------------|
| Active zone restore | sessionStorage |
| Orb context per project | studio-orb-runtime store |
| Cloud queue persistence | Supabase · aligns with Generation Manager |

---

## v2.0 — Full Arrival Sequence (CDS Reference)

Per [arrival-experience.md](../alpha/arrival-experience.md):

- 5s / 7s timed beats
- Camera presets
- Lighting section boot
- Mood Wall illumination sequence
- Audio fade
- Display boot

Requires Department Runtime camera + animation modules.

---

## v2.1 — Full Idle Life Profile

Per [runtime-behaviors.md](../alpha/runtime-behaviors.md):

- Mood Wall crossfade
- Lighting drift
- Screen rotation
- Assistant background work
- Desktop particle tier

---

## v2.2 — Ambient Storytelling Engine

| Feature | Description |
|---------|-------------|
| Signal → visual mapping | Manifest in department package |
| Fullness tiers | Mood wall · shelves · tables |
| Lifecycle plaques | Golden Build · Certified markers |
| Cross-department story | Packaging prototype on CDS Story Table |

Data-driven — not department-specific code.

---

## v2.3 — Emotional Design Validation

Integrate with Walk the Room™ + Certification:

- Emotion checklist per department
- Room DNA emotion audit
- Founder 30-second test

---

## Explicit Non-Goals

| Non-goal | Reason |
|----------|--------|
| New platform engine doc sprint | Systems sit above frozen runtime |
| Heavy animation before stability | User directive |
| Arrival as loading spinner | Violates system law |
| Per-department hardcoded arrival | Violates inheritance law |

---

## Sprint Recommendations

| Sprint | Focus |
|--------|-------|
| **Current** | Mobile stability ✓ in progress |
| **Next** | v1.1 lightweight arrival + interaction lock |
| **+1** | v1.2 orb breath idle |
| **+2** | v2.0 full CDS arrival (desktop first) |
| **+3** | v2.2 ambient storytelling signals |

---

## Cross-References

- [Golden Build](../production-lifecycle/golden-build.md)
- [Alpha validation](../alpha/alpha-validation.md)
- [Department Runtime animation](../engine/department-runtime/10_ANIMATION_SYSTEM.md)
