# 08 — Interaction Map

**Golden Department:** Creative Direction Studio™  
**Section:** Verb Bindings — Physical Actions Across Zones

---

## Interaction Philosophy

> Users **walk cameras** to zones and perform **physical verbs** on objects. No tabs. No forms. No click targets that look like web buttons.

All interactions bind to SDK Interaction Engine (`sdk/04_INTERACTION_ENGINE.md`) with department-specific zone routing.

---

## Primary Verbs

| Verb | SDK Class | CDS Dominance |
|------|-----------|---------------|
| `pin` | attach | Brief Wall, Mood Wall, Library |
| `annotate` | mark | Brief Wall, Mood Wall, Sandbox |
| `compare` | dual-view | Mood Wall, Sandbox, Timeline |
| `branch` | fork | Timeline, Sandbox |
| `reference-drop` | ingest | Mood Wall, Library |
| `approve` | ceremony | Timeline, Mood Wall |
| `reject` | archive | Mood Wall, Timeline, Sandbox |
| `scrub` | temporal-nav | Timeline, Mood Wall pan |
| `drag` | spatial-move | Mood Wall, Timeline, Library |
| `speak` | voice | Orb → all zones |
| `inspect` | detail | Observatory, Library, Timeline |
| `preview` | full-view | Sandbox, Library |
| `browse` | scroll | Library shelves |
| `filter` | illuminate | Library categories |
| `cluster` | group | Mood Wall lasso |
| `click` | select | Timeline nodes |

---

## Global Interaction Map

```
                    ┌─────────────────────────────────────┐
                    │           ORB COMMAND CENTER         │
                    │  speak · route · generate · navigate │
                    └──────────────┬──────────────────────┘
                                   │
     ┌─────────────┬───────────────┼───────────────┬─────────────┐
     ▼             ▼               ▼               ▼             ▼
 BRIEF WALL    MOOD WALL      TIMELINE TABLE   SANDBOX      LIBRARY
 pin·annotate  pin·drag·      scrub·branch·    branch·      browse·
 compare·speak cluster·       approve·reject   compare·     drag·filter
               compare·       drag·click       preview·     preview·pin
               approve·reject                  approve
     │             │               │               │             │
     └─────────────┴───────┬───────┴───────────────┴─────────────┘
                           ▼
                  GENOME OBSERVATORY
                  inspect·compare·pin·speak
```

---

## Zone Interaction Tables

### Entry Portal

| Verb | Object | Behavior |
|------|--------|----------|
| enter | portal-entry-cds | Triggers arrival sequence |
| — | — | No other verbs — transit only |

### Creative Brief Wall™

| Verb | Object | Behavior |
|------|--------|----------|
| pin | wall-brief-cds | Add note/reference to section rail |
| annotate | pinned card | Draw markup layer |
| drag | pinned card | Reorder section priority |
| compare | two pins | Side-by-side brief versions |
| speak | wall-brief-cds | Voice → Founder Notes section |
| inspect | section | Expand section detail on glass |

### Living Mood Wall™

| Verb | Object | Behavior |
|------|--------|----------|
| pin | wall-mood-cds | Stick reference to wall plane |
| drag | reference | Move on wall · parallax depth |
| cluster | multi-select | Lasso group · ring animation |
| compare | two references | Split wall view |
| annotate | reference | Markup overlay |
| reject | reference | Dissolve → Library archive |
| approve | reference | Glow → direction tier |
| reference-drop | drop zone | Ingest URL/image/reel |
| scrub | wall-mood-cds | Horizontal pan infinite canvas |
| inspect | reference | Full preview panel |

### Company Genome Observatory™

| Verb | Object | Behavior |
|------|--------|----------|
| inspect | observatory-cds | Zoom domain ring |
| compare | observatory-cds | Genome snapshot vs Project overlay |
| speak | observatory-cds | Orb explains domain |
| pin | domain node | Pin insight → Brief Wall |
| scrub | ring rotation | Manual orbit inspect |

### Project Timeline Table™

| Verb | Object | Behavior |
|------|--------|----------|
| scrub | table-timeline-cds | Move along timeline axis |
| drag | event node | Reschedule · move branch ribbon |
| click | event node | Select — detail glass card |
| compare | two states | Side-by-side timeline |
| branch | event node | Spawn parallel glass ribbon |
| approve | direction node | Ceremonial seal |
| reject | node | Fade → Sandbox return |
| annotate | event card | Quick note stroke |
| pin | event | Attach founder note card |

### Creative Sandbox™

| Verb | Object | Behavior |
|------|--------|----------|
| branch | table-sandbox-cds | Spawn isolated experiment |
| compare | screen-compare-cds | Twin screen slider |
| preview | concept card | Full-screen concept |
| approve | concept | Promote → Timeline main |
| reject | concept | Dissolve experiment |
| speak | sandbox zone | Orb generates 3 alternates |
| annotate | concept | Sketch overlay |

### Reference Library™

| Verb | Object | Behavior |
|------|--------|----------|
| browse | shelf-library-cds | Inertia shelf scroll |
| filter | category section | Illuminate shelf section |
| drag | reference spine | Drag → Mood Wall or Table |
| preview | spine hover | Large preview — shelf stays |
| search | shelf-library-cds | Voice/type — Orb assists |
| pin | reference | Quick pin to active project |
| inspect | reference | Metadata glass panel |

### Orb Command Center™

| Verb | Object | Behavior |
|------|--------|----------|
| speak | orb-cds | Natural language command |
| touch | pedestal ring | Activate listening |
| inspect | orb-cds | Show last command context |
| — | — | Orb routes verbs to zones |

### Exit Portal

| Verb | Object | Behavior |
|------|--------|----------|
| exit | portal-exit-cds | Departure sequence → next department |

---

## Gesture & Input Bindings

| Input | Default Verb | Context Override |
|-------|--------------|------------------|
| Tap | inspect / click | Timeline node vs wall pin |
| Long press | annotate | Mood Wall reference |
| Drag | drag | Any movable reference |
| Pinch | compare | Two selected references |
| Lasso | cluster | Mood Wall multi-select |
| Drop | reference-drop | Any drop zone |
| Hold | speak | Orb ring or Brief voice |
| Two-finger scrub | scrub | Timeline or Mood Wall pan |

---

## Ceremony Bindings

| Ceremony | Trigger Verb | Zones Involved | Runtime Contract |
|----------|--------------|----------------|------------------|
| `creative-approval` | approve | Timeline Table | Camera → ceremony · audio stamp · Production unlock |
| `branch-promotion` | approve (sandbox) | Sandbox → Timeline | Ribbon merge animation |
| `direction-reject` | reject | Mood Wall / Timeline | Archive dissolve · no Production signal |
| `departure` | exit | Exit Portal | Camera → departure path |

---

## AI-Triggered Interactions

| AI Role | Ambient Verb | Zone |
|---------|--------------|------|
| Creative Director | annotate (suggestion) | Brief Wall rail note |
| Research Concierge | pin (auto-tag) | Library + Mood Wall metadata |
| Brand Concierge | compare (flag) | Observatory divergence alert |
| Orb | speak (route) | All zones |

AI never executes `approve` without founder permission gate.

---

## State Mutations Per Verb

| Verb | Project State | Visual State | Audio State |
|------|---------------|--------------|-------------|
| pin | +reference | stick-bounce | soft land |
| approve | lock direction node | seal glow | ceremony stem |
| branch | +parallel branch | ribbon rise | branch tone |
| reject | archive reference | dissolve | fade tone |
| reference-drop | +pending ingest | shimmer landing | fetch tone |
| speak | +transcript | waveform | voice duck ambient |

---

## Reduced Motion Fallback

| Verb | Fallback |
|------|----------|
| scrub | Step discrete — no inertia |
| parallax | Static depth layers |
| stick-bounce | Instant land |
| ceremony | Static seal — no camera travel |
| particles | Off |

All verbs remain functional — beauty static, not disabled.

---

## SDK Compliance

| Requirement | Status |
|-------------|--------|
| All verbs in SDK verb registry | ✓ |
| Zone bounds defined | ✓ `01_THE_ROOM.md` |
| Object class bindings | ✓ `07_ASSET_STRATEGY.md` |
| Ceremony in runtime manifest | ✓ `creative-approval` |
| Permission gates | ✓ `creative-direction.approve` |

---

_Next: [09 — Orb & Concierge](./09_ORB_AND_CONCIERGE.md)_
