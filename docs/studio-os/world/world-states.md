# World States™

**Global headquarters mood — the business emotionally expressed in space**

---

## Purpose

Studio World™ supports **global states** that influence every department, Set™, transition, and AI surface.

The Headquarters should **emotionally respond** to what is happening in the business.

---

## What World States™ Are

A **World State™** is a coordinated atmosphere profile — not a UI theme.

| World State™ affects | Examples |
|---------------------|----------|
| **Lighting** | Warm morning · crisis cool · celebration gold |
| **Music / ambient audio** | Focus hush · launch pulse · holiday bells |
| **Orb dialogue** | Urgent brevity · celebratory warmth · quiet acknowledgment |
| **Department activity** | Idle Life™ density · NPC motion |
| **Ambient storytelling** | Display content · ticker topics |
| **AI behavior** | Proactivity · interruption policy |
| **Transitions** | Speed · ceremony · Transition DNA™ variants |
| **Walkthroughs** | Walk the Business™ · Walk the Room™ pacing |

---

## Canonical World States™

| State | Trigger (examples) | Atmosphere |
|-------|-------------------|------------|
| **Morning™** | Time of day · first arrival of day | Soft light · calm audio · briefing Orb |
| **Launch Day™** | Product/campaign go-live | Elevated energy · mission signage · pulse lighting |
| **Creative Sprint™** | Active creative deadline | Creative wing accent · faster Orb in atelier Sets™ |
| **Quiet Focus™** | Founder enables · calendar block | Reduced notifications · dim corridors · minimal Orb |
| **Celebration™** | Milestone · win · Golden Build Certified™ | Warm gold · confetti-class effects · congratulatory Orb |
| **Crisis™** | Critical issue · outage · urgent decision | Cool light · direct Orb · executive paths prioritized |
| **Holiday™** | Calendar · Life & Culture prefs | Seasonal decor · respectful tone |
| **Company Anniversary™** | Founding date | Legacy wing emphasis · Hall of Legacy™ spotlight |
| **Investor Visit™** | Scheduled visit · presentation mode | Executive corridor polish · reduced clutter |
| **Studio Event™** | Internal all-hands · live stream | Event signage · central plaza activation |

States may **stack** with precedence rules (Crisis™ > Celebration™ for lighting safety).

---

## State Precedence (Default)

```
1. Crisis™ / Emergency (Experience Engine overlap)
2. Investor Visit™ / Studio Event™ (scheduled)
3. Launch Day™
4. Celebration™
5. Creative Sprint™
6. Quiet Focus™
7. Holiday™ / Company Anniversary™
8. Morning™ / Time of day baseline
```

Founder override always available — never trap founder in wrong mood.

---

## State Resolution Pipeline

```
Inputs
├── Calendar & schedule
├── Business metrics (Pulse · Mission Control)
├── Production Lifecycle events (Certified™ · Live™)
├── Founder Journey™ stage
├── Life & Culture Preferences™
├── Manual founder selection
└── World Events™ (one-shot overlays)

        ↓
World State Resolver™
        ↓
Outputs
├── HQ lighting profile
├── Global audio bus
├── Orb personality modifiers
├── Transition DNA™ multipliers
├── Set DNA™ atmosphere overlays
├── AI interruption policy
└── Walk the Business™ route suggestions
```

---

## Per-Subsystem Modulation

### Sets™

Set DNA™ defines **baseline** personality. World State™ applies **overlay**:

```json
{
  "setId": "creative-atelier",
  "worldStateOverlay": {
    "launchDay": { "accentBoost": 1.2, "displayMode": "mission" },
    "quietFocus": { "ambientDensity": 0.3, "orbChattiness": 0 }
  }
}
```

### Transitions™

[Transition DNA™](./transitions/transition-dna.md) inherits active World State™:

- Launch Day™ → slightly faster walks · mission signage
- Celebration™ → optional confetti in glass corridors
- Crisis™ → Executive Corridor™ priority · shortened ceremony

### Orb

| State | Orb behavior |
|-------|--------------|
| Morning™ | "Good morning. Creative has three concepts ready." |
| Launch Day™ | "Launch is live. Marketing is monitoring." |
| Crisis™ | "Finance flagged an issue. Executive corridor is ready." |
| Quiet Focus™ | Silent unless tapped · badge only |

**Detail:** [transitions/orb-guidance.md](./transitions/orb-guidance.md)

---

## Relationship to Experience Engine™

**Experience Engine™** (platform) manages UI-level modes (Focus · Presentation · Night).

**World States™** (Studio World™) manage **immersive headquarters reality**.

| Layer | Scope |
|-------|-------|
| Experience Engine™ | Panels · notifications · Command Dock density |
| World States™ | Lighting · audio · spatial life · Orb · transitions |

They **sync** but World States™ is authoritative for **spatial** experience.

---

## Founder Controls

| Control | Location (conceptual) |
|---------|----------------------|
| Manual state override | Orb · Command Dock |
| Quiet Focus™ schedule | Life & Culture · calendar |
| Holiday response policy | Life & Culture Preferences™ |
| Crisis acknowledgment | Executive Set™ |

States should feel **discovered**, not configured — defaults from real business signals.

---

## Data Model (Conceptual)

```typescript
interface WorldStateProfile {
  stateId: WorldStateId;
  priority: number;
  lighting: LightingProfile;
  audio: AudioProfile;
  orb: OrbModifier;
  transitions: TransitionModifier;
  sets: Record<SetId, SetOverlay>;
  ai: AiBehaviorModifier;
  startedAt: ISO8601;
  expiresAt?: ISO8601;
  source: 'calendar' | 'metrics' | 'lifecycle' | 'founder' | 'event';
}
```

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Per-page theme CSS | Not spatial — violates philosophy |
| State with no Set™ effect | World State™ must cascade |
| Permanent Celebration™ | Dilutes meaning |
| Crisis™ without calm exit path | Stress without resolution |
| State that pauses the world | Violates World Rules™ |

---

## Cross-References

- [world-events.md](./world-events.md) — one-shot moments that may trigger states
- [world-evolution.md](./world-evolution.md) — permanent growth vs temporary states
- [Founder Journey™](../alpha/founder-journey.md)
- [Emotional Design Principle™](../foundational-experience-systems/emotional-design-principle.md)
