# Runtime Behaviors — Creative Direction Studio™ Alpha

**Discipline owners:** AI engineer · Gameplay programmer · Motion designer · Technical animator  
**Lifecycle:** LOADING → ASSEMBLING → GENOME_INJECTING → ACTIVE

---

## Runtime Intent

Behaviors make the room **feel occupied by intelligence** — not animated by a loading spinner.

Every behavior reinforces: *this is a living creative workplace.*

---

## Department State Machine

```
LOADING
  └─ load package · resolve registry refs
ASSEMBLING
  └─ mount 35 objects · wire interactions
GENOME_INJECTING
  └─ apply Company · Project · Room DNA · Founder Journey
ACTIVE
  └─ full simulation — walk · verb · ceremony
PAUSED (founder)
  └─ generation job paused — room ambient only
WALK_THE_ROOM
  └─ presentation mode — critique path
CEREMONY
  └─ approval sequence — limited verbs
```

---

## Studio Orb Behaviors

### Idle

| Behavior | Spec |
|----------|------|
| Float | 2cm vertical sine · 4s period |
| Glow | Genome accent pulse · 6s |
| Rotate | Slow 360° · 120s · interrupted by speak |
| Audio | None |

### Greeting (arrival)

| Trigger | Behavior |
|---------|----------|
| Arrival phase 3s | Pulse bright · rotate 15° to founder |
| Voice | Genome register line · project aware |
| First visit | Extended zone scan animation · 7s total |

### Speak Routing

```
Founder speak
    ↓
Intent classify (creative · research · brand · navigate)
    ↓
Route to concierge
    ↓
Concierge response (voice + optional surface action)
    ↓
Orb acknowledge pulse
```

**Never:** Auto-approve · auto-pin without founder confirm.

### Proactive (sparse)

| Condition | Orb line |
|-----------|----------|
| 3 new references | *"Three references arrived overnight."* |
| Branch awaiting | *"Branch B awaits your review."* |
| No project | *"Ready to begin a new direction?"* |

Max 1 proactive per 10 min session — respects Founder Cognitive Load™.

### Ceremony

Orchestrates: dim light · pedestal spot · audio stinger · Mood Wall approve glow · Timeline lock.

---

## Concierge Behaviors

### Creative Director (`ai-creative-director-cds`)

| Role | Behavior |
|------|----------|
| Brief coherence | Ambient note on Brief rail when direction shifts |
| Branch counsel | Suggests compare when 2+ branches active |
| Approval prep | Summarizes before Founder Review |
| Never | Auto-approve |

### Research Concierge (`ai-research-concierge-cds`)

| Trigger | Behavior |
|---------|----------|
| reference-drop | Auto-tag: lighting · mood · material · typography |
| Library ingest | Spine label generation |
| Mood Wall cluster | Suggest cluster name |

### Brand Concierge (`ai-brand-concierge-cds`)

| Trigger | Behavior |
|---------|----------|
| Pin to Mood Wall | Genome compliance check — gentle warn |
| Approval attempt | thingsWeNeverDo scan |
| Observatory | Explain domain in brand voice |

All consult Company Genome™ before utterance.

---

## Zone State Behaviors

### Mood Wall

| State | Visual | Transition |
|-------|--------|------------|
| empty | Neutral elegant texture | → pinned on first pin |
| pinned | References tiled | → clustered |
| clustered | Boundary glow groups | → comparing |
| comparing | Split view | → approved/reject |
| approved | Hero glow persist | ceremony link |

### Timeline Table

| State | Visual |
|-------|--------|
| single | One branch lane |
| branched | Parallel glass lanes |
| comparing | Split table |
| approved | Locked glow · sandbox merges |

### Sandbox

| State | Visual |
|-------|--------|
| dormant | Frosted partition opaque |
| isolated | Partition clear · branch cards |
| merging | Cards travel to timeline |

---

## Animation Behaviors

| Animation ID | Trigger | Duration | Easing |
|--------------|---------|----------|--------|
| `arrival-dolly` | Entry | 2s | editorial ease |
| `project-hydrate` | Project bind | 2.5s | stagger 150ms |
| `pin-stick` | pin verb | 0.4s | bounce out |
| `branch-fork` | branch verb | 0.8s | glass split |
| `approve-ceremony` | approve | 3.5s | multi-phase |
| `reject-dissolve` | reject | 1.2s | fade + particles |
| `panel-reveal` | approach zone | 0.6s | fade up |
| `orb-greeting` | arrival | 1s | pulse |

Reduced motion: instant state changes · no dolly · ceremony audio only.

---

## Audio Behaviors

| Layer | State machine |
|-------|---------------|
| Ambient bed | 0% arrival → 20% active → 15% ceremony → 20% post |
| Zone accent | Brief work · subtle high pass shift |
| SFX | One-shot per verb |
| Orb voice | TTS or recorded · genome voice profile |
| Exterior | Constant low world bed |

---

## Lighting Behaviors

| Trigger | Rig response |
|---------|--------------|
| Zone focus | Local accent +5% on active zone |
| Mood Wall scrub | Rim follow pan |
| Approval | Global -20% except pedestal |
| Walk the Room | Sequential spot per marker |
| Sandbox active | Warm fill +10% |

---

## Particle Behaviors

| System | Behavior |
|--------|----------|
| Ambient dust | Key light volume only · max 200 particles |
| Approve burst | One-shot celebration · 1s |
| Reject fade | Reference dissolve assist |
| Observatory | Orbit genome viz · low count |

Mobile: 50% particle budget.

---

## Genome Runtime Injection

On `GENOME_INJECTING`:

```
For each object with genomeSlots[]:
  resolve live Company Genome snapshot
  apply shader uniforms · voice · typography register
Room DNA sliders → lighting warmth · glass transparency · luxury spec
Project Genome → content hydration targets
```

**No rebake** — live slots only.

---

## Generation Job Integration

When Generation Manager active:

| Job state | Room behavior |
|-----------|---------------|
| running | Founder progress UI (environmental · not modal) |
| item generating | Zone subtle pulse if asset belongs to zone |
| complete | Hydrate new artifact in place · no full reload |
| failed | Orb notify · zone unchanged |

Founder may **pause** — room stays ambient · job holds.

---

## Session Persistence

| Persists | Per session |
|----------|-------------|
| Pins · branches · approvals | ✓ |
| Chronicle entries | ✓ |
| Camera last position | ✓ |
| Generation job state | ✓ |
| Mood Wall content | ✓ project scope |

---

## Error Behaviors

| Failure | Room response |
|---------|---------------|
| Asset missing | Zone placeholder wireframe — not white box |
| Genome unresolved | Observatory amber · Orb explains |
| Concierge timeout | Orb: *"Give me a moment."* — no stack trace |
| Network loss | Ambient continues · sync badge on Orb only |

Never break immersion with developer error dialogs.

---

## Golden Rule Test

> Behaviors feel like **a staffed creative studio** — Orb partner · walls that respond · ceremony weight — not like a web app updating state.

Pass: Approval dims room · pin bounces · Orb faces you.  
Fail: Toast says "Saved successfully."

---

_Runtime behaviors — the room performs creative direction._
