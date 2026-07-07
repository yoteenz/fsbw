# 06 — Orb Runtime

**Engine Module:** `studio.department-runtime.v1.orb`  
**Status:** Orb actor specification  
**Philosophy:** The Orb is a runtime actor — not a widget

---

## Definition

**Studio Orb™** operates as a first-class **runtime actor** anchored to the Orb Pedestal object. It provides ambient intelligence, navigation, conversation, and command routing across the department and Headquarters.

---

## Orb Actor Schema

```yaml
OrbActor:
  instanceId: orb-runtime
  state: OrbState
  position: Vector3                   # pedestal anchor
  genomePersonality: GenomeVoiceProfile
  memory: OrbMemory
  context: OrbContext

OrbState:
  mode: enum                          # idle | listening | speaking | thinking | navigating | notifying
  visibility: enum                    # peripheral | focused | hidden
  glowIntensity: number
  animationClip: string

OrbContext:
  departmentId: string
  activeProject: ProjectRef | null
  userPreferences: LifeCulturePreferences
  nearbyObjects: RuntimeObject[]
  pendingNotifications: Notification[]
  departmentConnections: string[]
```

---

## Capabilities

### Navigation

| Capability | Behavior |
|------------|----------|
| Department routing | "Take me to Marketing" → Navigation Engine |
| Zone guidance | Subtle camera nudge toward primary zone |
| Return path | "Go back" → last department |
| Quick travel | Orb confirms → abbreviated transit |
| World map | Orb can open map overlay |

### Conversation

| Capability | Behavior |
|------------|----------|
| Natural language | Parse intent → verb or command |
| Concierge dispatch | Route to specialist Concierge |
| Context answers | Department + Project aware |
| Voice mode | TTS + STT with Genome voice |

### Recommendations

| Capability | Behavior |
|------------|----------|
| Proactive suggestions | Based on Project state + Genome |
| Blocker alerts | Production Manager escalation surface |
| Genome enrichment | Suggest missing Genome domains |
| Next action | "Your approval is pending at Review" |

### Awareness Layers

| Layer | Source |
|-------|--------|
| **Project** | Project Runtime (15) |
| **Department** | State Manager department state |
| **Genome** | Company Genome snapshot |
| **User** | Session + Life & Culture Preferences™ |
| **HQ** | Headquarters context — other departments |

### Memory

| Scope | Retention |
|-------|-----------|
| Session | Current visit commands and context |
| Preferences | User interaction patterns |
| Organization | Genome-aligned communication prefs |

### Task Execution

Orb **routes** tasks — does not auto-approve:

```
User: "Approve the campaign"
Orb: routes to Approval Station + highlights object
User must execute approve verb
```

### Visual Reactions

| Event | Reaction |
|-------|----------|
| Arrival | Pulse + optional greeting |
| Notification | Bounce + pedestal glow |
| Listening | Scale pulse 1.0–1.05 |
| Speaking | Glow sync with speech |
| Thinking | Slow rotation |
| Genome update | Color crossfade |

### Movement

| Motion | Specification |
|--------|---------------|
| Idle float | ±3px vertical, 3s sine |
| Activate rise | +10px, 200ms |
| Focus turn | Face user on conversation |
| Platform-consistent | Same across all departments |

---

## Orb Integration Map

```
Orb Runtime
    ↔ Interaction Engine (05) — speak, orb-conversation
    ↔ Navigation Engine (08) — travel dispatch
    ↔ Concierge Runtime (07) — specialist routing
    ↔ Project Runtime (15) — project context
    ↔ Genome Injection (13) — voice, personality, glow
    ↔ Animation Engine (10) — state animations
    ↔ Audio Engine (12) — voice output, notification sounds
    ↔ State Manager (14) — orb state persistence
```

---

## Orb Forbidden Behaviors

| Forbidden | Why |
|-----------|-----|
| Auto-approve | Human supremacy |
| Hidden decisions | Transparency |
| Widget overlay only | Must exist in world space |
| Per-department mesh | Platform-consistent visual |
| Hardcoded personality | Genome-driven |

---

_Next: [07 — Concierge Runtime](./07_CONCIERGE_RUNTIME.md)_
