# Transition Types™ — Reusable Library

**Version:** 1.0.0  
**Status:** Canonical transition catalog  
**Registry:** `studio.transition-types.v1`

---

## Purpose

A **library of reusable transition experiences** — every edge between Sets™ uses a typed transition, not a generic page change.

Each type has distinct camera · lighting · audio · duration · storytelling role.

---

## Type Catalog

### Arrival™

| Attribute | Value |
|-----------|-------|
| **Use** | Entering Headquarters from outside |
| **Duration** | 8–15s first visit · 4–8s return |
| **Camera** | Exterior approach → plaza → threshold |
| **Story** | "You are entering your company" |
| **Orb** | Welcome · company identity |
| **Example** | First headquarters entry of the day |

---

### Walk™

| Attribute | Value |
|-----------|-------|
| **Use** | Walking down a corridor between adjacent Sets™ |
| **Duration** | 3–8s |
| **Camera** | Shoulder-height dolly · passing doorways |
| **Story** | Daily circulation · department signage |
| **Orb** | Light context · "Marketing is ahead" |
| **Example** | Creative Wing internal movement |

---

### Elevator™

| Attribute | Value |
|-----------|-------|
| **Use** | Moving between floors |
| **Duration** | 5–12s |
| **Camera** | Interior cab · floor indicator · doors part |
| **Story** | Vertical org hierarchy · floor identity |
| **Orb** | Floor briefing |
| **Example** | Operations wing → Executive floor |

---

### Skybridge™

| Attribute | Value |
|-----------|-------|
| **Use** | Connecting distant departments across lot |
| **Duration** | 8–15s |
| **Camera** | Elevated walk · vista of headquarters |
| **Story** | Scale of company · wing overview |
| **Orb** | Wing status panorama |
| **Example** | Creative Wing → Production Wing |

---

### Glass Hallway™

| Attribute | Value |
|-----------|-------|
| **Use** | Transparent corridor overlooking Headquarters |
| **Duration** | 5–10s |
| **Camera** | Side vista · reflections · depth |
| **Story** | Transparency · creative oversight |
| **Orb** | Cross-department awareness |
| **Example** | Creative Atelier™ → Discovery Lab™ |

---

### Executive Corridor™

| Attribute | Value |
|-----------|-------|
| **Use** | Leading toward executive spaces |
| **Duration** | 4–8s |
| **Camera** | Formal dolly · wider framing |
| **Story** | Authority · decision weight |
| **Orb** | Measured register |
| **Example** | Any wing → Founder Office™ Set |

---

### Security Checkpoint™

| Attribute | Value |
|-----------|-------|
| **Use** | Biometric entry into protected departments |
| **Duration** | 4–6s |
| **Camera** | Slow approach · scan beat · doors unlock |
| **Story** | Protection · trust · compliance |
| **Orb** | Authorization confirmation |
| **Example** | Entry to Finance Vault™ · Legal Chamber™ |

---

### Gallery Walk™

| Attribute | Value |
|-----------|-------|
| **Use** | Moving through historic achievements before Archive™ |
| **Duration** | 10–20s (may extend on first visit) |
| **Camera** | Slow gallery pace · exhibit pass |
| **Story** | Company history · milestones |
| **Orb** | Reflective narrative |
| **Example** | Any wing → Hall of Legacy™ Set |

---

### Innovation Tunnel™

| Attribute | Value |
|-----------|-------|
| **Use** | Transition into futuristic experimental departments |
| **Duration** | 6–12s |
| **Camera** | Forward momentum · light acceleration |
| **Story** | Experimentation · future-facing |
| **Orb** | Exploratory encouragement |
| **Example** | Headquarters → Innovation Lab (future) |

---

### Portal™

| Attribute | Value |
|-----------|-------|
| **Use** | Reserved for future digital or AI-native experiences |
| **Duration** | TBD |
| **Camera** | Non-physical · dimensional |
| **Story** | AI realm · data space |
| **Orb** | Full guide mode |
| **Status** | **Reserved** — not alpha |

---

### Panoramic Elevator™ (Extended Elevator™)

| Attribute | Value |
|-----------|-------|
| **Use** | Dramatic vertical journey with exterior view |
| **Duration** | 8–14s |
| **Camera** | Glass cab · city/headquarters panorama |
| **Story** | Scale · aspiration |
| **Example** | Marketing War Room™ → Finance Vault™ |

---

## Canonical Headquarters Journey

Example path using typed transitions:

```
Creative Atelier™ Set
    ↓ Glass Hallway™ (5s)
Discovery Lab™ Set
    ↓ Executive Corridor™ (6s)
Marketing War Room™ Set
    ↓ Panoramic Elevator™ (10s)
Finance Vault™ Set
    ↓ Gallery Walk™ (15s)
Hall of Legacy™ Set
```

---

## Type Selection Rules

| Factor | Influences type |
|--------|-----------------|
| **Distance** | Walk vs Skybridge vs Elevator |
| **Security** | Security Checkpoint™ required |
| **Emotion target** | Gallery Walk → nostalgic · Innovation Tunnel → curious |
| **Founder Journey™** | Legacy stage → longer Gallery Walk |
| **Business state** | Celebration™ → brighter lighting on all types |
| **Adaptive Walk™** | Route optimization across graph |

---

## Type Schema

```json
{
  "transitionType": {
    "id": "glass-hallway-v1",
    "displayName": "Glass Hallway™",
    "category": "corridor",
    "defaultDurationMs": 7000,
    "cameraPreset": "corridor-vista-dolly",
    "audioProfile": "ambient-corridor-glass",
    "lightingProfile": "transparency-rim",
    "orbGuidanceMode": "contextual-brief",
    "allowsWorldStreaming": true,
    "pausesIdleLife": false
  }
}
```

---

## Cross-References

- [Transition DNA](./transition-dna.md)
- [Camera language](./camera-language.md)
- [Movement system](./movement-system.md)
- [Marketplace transitions](./marketplace-transition-system.md)
