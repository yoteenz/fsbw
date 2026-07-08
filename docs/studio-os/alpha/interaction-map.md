# Interaction Map — Creative Direction Studio™ Alpha

**Discipline owners:** UX · Gameplay design · Interaction design  
**Law:** Physical verbs on objects — not web controls

---

## Interaction Philosophy

Users **walk** to zones. They **perform verbs** on objects. They never click tabs.

Every affordance looks like it belongs in a **room** — pin rails, glass surfaces, pedestals, walls — not buttons.

---

## Global Verb Set

| Verb | Physical metaphor | Primary zones |
|------|-------------------|---------------|
| `pin` | Stick to rail / wall | Brief · Mood · Library |
| `annotate` | Mark on surface | Brief · Mood · Sandbox |
| `drag` | Move on plane | Mood · Timeline · Library |
| `cluster` | Lasso group | Mood Wall |
| `compare` | Split view | Mood · Sandbox · Branch · Brief |
| `branch` | Fork timeline | Timeline · Sandbox |
| `scrub` | Pan / time navigate | Timeline · Mood horizontal |
| `approve` | Ceremony commit | Timeline · Mood · Founder Review |
| `reject` | Dissolve to archive | Mood · Timeline · Sandbox |
| `reference-drop` | Place inspiration | Mood · Drop zone · Library |
| `speak` | Voice to Orb | Orb → routes everywhere |
| `inspect` | Lean in detail | Observatory · Library · Timeline node |
| `preview` | Full immersion | Sandbox · Library item |
| `browse` | Shelf scroll | Library |
| `filter` | Illuminate category | Library |
| `click` | Select node | Timeline |
| `enter` | Cross portal | Entry · Exit |

---

## Zone Interaction Tables

### Arrival Zone (`portal-entry-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `enter` | Threshold light floor strip | Triggers arrival sequence |
| walk | Forward after settle | Free exploration |

No other verbs — transit sacred.

---

### Creative Brief Wall™ (`wall-brief-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `pin` | Brass rail · magnetic stick SFX | Content attaches to section |
| `annotate` | Touch wall · ink layer | Markup persists per pin |
| `drag` | Pin card edge | Reorder section priority |
| `compare` | Two pins selected | Wall splits — side by side |
| `speak` | Orb listening | Transcript → Founder Notes section |

**Ambient:** Pins sway 0.5px — air current. Not interactive.

---

### Living Mood Wall™ (`wall-mood-cds`) — HERO

| Verb | Affordance | Response |
|------|------------|----------|
| `pin` | Surface stick | Reference tiles in |
| `drag` | Reference edge | Reposition on depth plane |
| `cluster` | Lasso gesture | Group with soft boundary glow |
| `compare` | Two refs | Split wall comparison |
| `annotate` | Draw on ref | Markup layer |
| `approve` | Ref glow ceremony | Promoted to direction |
| `reject` | Ref dissolve | Archive — particle fade |
| `reference-drop` | Drag from drop zone / paste | Ingest pipeline |
| `scrub` | Horizontal pan | Infinite wall scroll |

**Ambient:** Parallax drift · color breathe — wall feels alive.

---

### Project Timeline Table™ (`table-timeline-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `scrub` | Glass surface horizontal | Move through time |
| `branch` | Node fork gesture | Spawn sandbox branch |
| `click` | Node tap | Select event |
| `drag` | Node move | Reorder within lane |
| `approve` | Node glow + ceremony hook | Direction locked on branch |
| `reject` | Node fade | Archive branch |
| `compare` | Two nodes | Split table view |

Floating status panel attaches to table edge — genome-tinted glass, not HUD.

---

### Creative Sandbox™ (`table-sandbox-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `branch` | Isolate from timeline | Frosted partition clears |
| `preview` | Card lift | Full sandbox immersion |
| `compare` | Two cards | Side by side |
| `annotate` | Card surface | Experiment notes |
| `approve` | Card to timeline | Merge ceremony |

Visual: isolated behind main table — "safe to break things."

---

### Branch Comparison Area™ (`screen-compare-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `compare` | Split screen default | Two branches visual |
| `approve` | Center pedestal link | Choose winning branch |
| `inspect` | Lean forward | Detail metadata |

---

### Reference Library™ (`shelf-library-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `browse` | Shelf vertical scroll | Physical shelf motion |
| `drag` | Book/spine pull | To Mood Wall or table |
| `filter` | Category spine glow | Illuminate subset |
| `preview` | Open volume | Full reference view |
| `pin` | Quick stick | Send to Mood Wall |

Right flank — glass exterior behind — research meets world.

---

### Company Genome Observatory™ (`observatory-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `inspect` | Dome lean-in | Genome ring detail |
| `compare` | Two domains | Side rings |
| `pin` | Insight stick | To Brief Wall |
| `speak` | Ask Orb | Explains domain |

Data particles orbit — not chart.js.

---

### Orb Command Center™ (`orb-cds` · `pedestal-orb-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `speak` | Voice · push-to-talk optional | Routes to concierge |
| `inspect` | Orb approach | Status · suggestions |
| navigate | "Take me to…" voice | Camera to zone |
| generate | Creative command | Triggers downstream (future handoff) |

Orb rotates toward speaker · idle animation between.

---

### Inspiration Drop Zone™ (`zone-inspiration-drop-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `reference-drop` | Floor glow circle | Paste URL · upload · drag file |
| — | Brighten on approach | Affordance without arrow |

Pipeline: ingest → Research Concierge tags → Mood Wall or Library.

---

### Founder Review Area™ (`pedestal-approval-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `approve` | Pedestal ceremony | Full approval sequence |
| `reject` | Pedestal dim | Return to revision |

Linked: `ceremony-approval-cds` · `audio-ceremony-cds`.

---

### Founder Notes Panel™ (`panel-founder-notes-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `speak` | Voice capture | Chronicle append |
| `annotate` | Sketch layer | Persist session |
| `pin` | Note stick | Link to Brief section |

Floating acrylic — not modal dialog.

---

### Exit Portal (`portal-exit-cds`)

| Verb | Affordance | Response |
|------|------------|----------|
| `enter` | Threshold | Transition to Discover Department™ |
| — | Orb line optional | "Creative direction approved — discover what's next." |

---

## What Responds vs What Moves

| Object | Responds to founder | Autonomous motion |
|--------|---------------------|-------------------|
| Mood Wall | pin · drag · scrub | breathe · parallax |
| Timeline | branch · scrub | hydrate rise on load |
| Orb | speak | idle float · greeting rotate |
| Brief pins | pin · drag | sway |
| Particles | — | ambient drift |
| Observatory viz | inspect | particle orbit |
| Glass panels | inspect context | fade in/out |
| Library shelves | browse | slide |

---

## Feedback Language

| Action | Visual | Audio | Haptic (mobile) |
|--------|--------|-------|-----------------|
| Pin | Stick bounce | Soft click | Light tap |
| Branch | Glass split | Shift tone | Medium |
| Approve | Gold pulse · dim room | Ceremony stinger | Strong |
| Reject | Dissolve | Low tone | — |
| Speak Orb | Orb brighten | Acknowledge blip | — |

No toast notifications. Feedback is **environmental**.

---

## Interaction Golden Rule

> Every interaction must look like something you would do in a **physical creative studio** — pin, walk, compare, approve — never like filling a form.

Pass: Verbs map to real creative workplace gestures.  
Fail: Primary action is "Submit" or "Save" on a card.

---

_Interaction map — gameplay in a creative headquarters._
