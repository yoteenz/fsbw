# Interactions Catalog — Creative Direction Studio™

**Department ID:** `creative-direction`  
**Manifest:** [interaction-manifest.json](./interaction-manifest.json)  
**Principle:** Physical verbs in a place — not forms on a page

---

## Interaction Schema

Every interaction entry includes:

| Field | Description |
|-------|-------------|
| **trigger** | Input gesture or event |
| **object** | Asset ID involved |
| **userAction** | What founder does |
| **aiResponse** | Concierge or Orb behavior |
| **stateChange** | Project / visual / audio mutation |
| **output** | Downstream signal |

---

## Inspiration Injection

### Drop Inspiration

| Field | Value |
|-------|-------|
| trigger | drop |
| object | `zone-inspiration-drop-cds` · `wall-mood-cds` |
| userAction | Drag image/file into drop zone or Mood Wall |
| aiResponse | Research Concierge auto-tags · suggests shelf category |
| stateChange | `+pendingReference` → `+pinnedReference` on ingest complete |
| output | Reference appears on Mood Wall or Library shelf |

### Paste Link

| Field | Value |
|-------|-------|
| trigger | paste · speak |
| object | `wall-mood-cds` · `orb-cds` |
| userAction | Paste URL or tell Orb a link |
| aiResponse | Research Concierge fetches preview · tags metadata |
| stateChange | `reference-drop` ingest pipeline |
| output | Shimmer landing animation → pin available |

### Upload Screenshot

| Field | Value |
|-------|-------|
| trigger | drop · upload |
| object | `zone-inspiration-drop-cds` |
| userAction | Upload screenshot file |
| aiResponse | Visual Research analyzes composition · lighting · palette |
| stateChange | `+reference` with analysis metadata |
| output | Pin to Mood Wall or Library |

---

## Mood Wall Interactions

### Pin Reference

| Field | Value |
|-------|-------|
| trigger | drop · click |
| object | `wall-mood-cds` |
| userAction | Stick reference to wall plane |
| aiResponse | Research Concierge tags categories |
| stateChange | `empty→pinned` · stick-bounce 400ms |
| output | `project.creativeDirection.moodBoard.+ref` |

### Cluster References

| Field | Value |
|-------|-------|
| trigger | lasso |
| object | `wall-mood-cds` |
| userAction | Multi-select references |
| aiResponse | Editorial Art Director suggests cluster name |
| stateChange | Ring cluster animation |
| output | `moodBoard.cluster.{id}` |

### Annotate Image

| Field | Value |
|-------|-------|
| trigger | long-press · draw |
| object | `wall-mood-cds` · pinned reference |
| userAction | Draw markup on reference |
| aiResponse | Creative Director may add suggestion stroke (dashed) |
| stateChange | `+annotationLayer` |
| output | Annotation persisted on reference |

### Approve Reference

| Field | Value |
|-------|-------|
| trigger | click |
| object | `wall-mood-cds` |
| userAction | Promote reference to direction tier |
| aiResponse | Brand Concierge confirms Genome alignment |
| stateChange | Reference glow · direction tier |
| output | `moodBoard.approved[]` — requires founder permission |

### Reject Reference

| Field | Value |
|-------|-------|
| trigger | click |
| object | `wall-mood-cds` |
| userAction | Remove from active consideration |
| aiResponse | — |
| stateChange | Dissolve → Library archive shelf |
| output | `moodBoard.archived[]` |

---

## Orb Interactions

### Ask Orb

| Field | Value |
|-------|-------|
| trigger | speak · hold on pedestal ring |
| object | `orb-cds` |
| userAction | Natural language command |
| aiResponse | Orb triages to concierge · executes or routes |
| stateChange | `idle→listening→thinking→speaking` |
| output | Zone camera shift · action execution |

### Run Creative Command

| Field | Value |
|-------|-------|
| trigger | speak |
| object | `orb-cds` · `console-command-cds` |
| userAction | *"Generate three luxury directions"* · *"Find stronger references"* |
| aiResponse | Spawn sandbox cards · populate library search |
| stateChange | Sandbox or Library update |
| output | See Orb command table in ai-team.md |

---

## Branching & Direction

### Create Branch

| Field | Value |
|-------|-------|
| trigger | click on timeline node |
| object | `table-timeline-cds` |
| userAction | Spawn parallel creative path |
| aiResponse | Creative Director names branch suggestion |
| stateChange | Glass ribbon rise 600ms |
| output | `timeline.branches.+branch` |

### Compare Branches

| Field | Value |
|-------|-------|
| trigger | pinch · click |
| object | `table-branch-compare-cds` · `screen-compare-cds` |
| userAction | Side-by-side branch evaluation |
| aiResponse | Creative Director comparison notes |
| stateChange | Twin screen / dual timeline view |
| output | Comparison session metadata |

### Merge Branch

| Field | Value |
|-------|-------|
| trigger | approve (sandbox) |
| object | `table-sandbox-cds` → `table-timeline-cds` |
| userAction | Promote sandbox experiment to main path |
| aiResponse | Creative Director confirms merge impact |
| stateChange | `branch-promotion` ceremony |
| output | `timeline.mainBranchUpdated` |

### Change Direction

| Field | Value |
|-------|-------|
| trigger | speak · click |
| object | `table-timeline-cds` |
| userAction | Initiate direction pivot |
| aiResponse | Orb initiates branch ceremony · Creative Director brief update |
| stateChange | New branch ribbon · Brief Wall living summary update |
| output | `creativeDirection.pivot` event |

---

## Brief & Genome

### Edit Creative Brief

| Field | Value |
|-------|-------|
| trigger | pin · speak · drag |
| object | `wall-brief-cds` |
| userAction | Update mission · objective · audience sections |
| aiResponse | Creative Director drafts living summary |
| stateChange | Section pin reorder · content update |
| output | `project.creativeDirection.brief` |

### Review Company Genome

| Field | Value |
|-------|-------|
| trigger | inspect · speak |
| object | `observatory-cds` |
| userAction | Explore domain rings |
| aiResponse | Brand Concierge explains · flags divergence |
| stateChange | Ring zoom · compare overlay |
| output | `genome.insight` · optional pin to Brief |

---

## Approval & Handoff

### Submit Direction

| Field | Value |
|-------|-------|
| trigger | approve on timeline node |
| object | `pedestal-approval-cds` · `table-timeline-cds` |
| userAction | Ceremonial direction commit |
| aiResponse | Creative Director confirms readiness |
| stateChange | `creative-approval` ceremony 3000ms |
| output | `production.unlock` signal · Validation Loop checkpoint |

### Send to Discover Department™

| Field | Value |
|-------|-------|
| trigger | speak · walk to exit |
| object | `portal-exit-cds` |
| userAction | *"Take me to Discovery"* or exit portal |
| aiResponse | Orb navigation · departure ceremony |
| stateChange | `departure` ceremony |
| output | Navigate to `discovery` department with project context |

---

## Walk the Room™

### Start Walk the Room™

| Field | Value |
|-------|-------|
| trigger | speak · activate markers |
| object | `markers-walk-room-cds` |
| userAction | *"Walk the room"* or follow path markers |
| aiResponse | Orb moderates · Braintrust assembles for Creative Direction session |
| stateChange | Presentation mode · spatial critique path |
| output | Critique session transcript · action items → Creative Direction Notes |

---

## Founder Notes

### Capture Founder Note

| Field | Value |
|-------|-------|
| trigger | speak · pin |
| object | `panel-founder-notes-cds` |
| userAction | Voice or written note |
| aiResponse | Founder Memory Concierge transcribes · timestamps |
| stateChange | Glass card on Timeline or Brief section |
| output | `founderNotes.+entry` · Chronicle append |

---

## Gesture → Verb Map

| Input | Verb | Context |
|-------|------|---------|
| Tap | inspect / click | Timeline node vs wall |
| Long press | annotate | Mood Wall reference |
| Drag | drag / scrub | Reference move or timeline |
| Pinch | compare | Two selected items |
| Lasso | cluster | Mood Wall multi-select |
| Drop | reference-drop / pin | Drop zones |
| Hold | speak | Orb ring · Brief voice |
| Two-finger scrub | scrub | Timeline or Mood Wall pan |

---

## Sandbox Isolation Rule

> No interaction in `sandbox` zone mutates `project.creativeDirection.main*` until **approve** promotes branch. Enforced at Runtime state manager.
