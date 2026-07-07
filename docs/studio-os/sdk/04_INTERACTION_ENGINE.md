# 04 — Interaction Engine

**SDK Module:** `studio.department.sdk.v1.interaction`  
**Status:** Department-level interaction contract  
**Parent platform system:** [Interaction Engine™ M130](../interaction-engine.md)  
**Philosophy:** Interactions feel physical — nothing relies solely on forms

---

## Definition

The Department Interaction Engine defines **how users manipulate objects, complete work, and collaborate with AI** inside a department world. It extends the platform Interaction Engine™ with department-specific verbs while maintaining platform-wide behavioral consistency.

> Users click, drag, pin, approve, scrub, and speak — they do not fill out forms to do their job.

---

## Relationship to Platform Interaction Engine™

| Layer | Scope |
|-------|-------|
| **Platform Interaction Engine™ (M130)** | Global behavioral law — hover, focus, click, states, accessibility |
| **Department Interaction Engine (this doc)** | Department verbs — physical work actions on objects and zones |
| **Object Interaction Profiles (03)** | Per-object verb subsets |

Department verbs MUST inherit platform states (Idle, Hover, Focused, Pressed, Loading, Disabled, Success, Error) and motion timing tokens.

---

## Interaction Verb Catalog

Every department interaction is a **verb** applied to an **object** or **zone**. Verbs are never menu items.

### Pointer Verbs

| Verb | ID | Description | Primary Objects |
|------|----|-------------|-----------------|
| **Click** | `click` | Select, activate, open detail | All interactive objects |
| **Drag** | `drag` | Move items across surfaces | Glass Table, Timeline Table, Project Board, Asset Shelf |
| **Pin** | `pin` | Attach item to Interactive Wall or reference board | Floating Panel, Asset Shelf, Interactive Wall |
| **Scrub** | `scrub` | Traverse temporal or spatial continuum | Timeline Table, Media Display |

### Decision Verbs

| Verb | ID | Description | Primary Objects |
|------|----|-------------|-----------------|
| **Approve** | `approve` | Ceremonial acceptance — triggers output port | Approval Station, Preview Screen |
| **Reject** | `reject` | Ceremonial rejection — returns work with reason | Approval Station, Preview Screen |
| **Branch** | `branch` | Create variant path without rejecting original | Approval Station, Interactive Wall, Project Board |
| **Compare** | `compare` | Side-by-side evaluation of two items | Glass Table, Preview Screen, Interactive Wall |

### Content Verbs

| Verb | ID | Description | Primary Objects |
|------|----|-------------|-----------------|
| **Annotate** | `annotate` | Draw, mark, comment on surface | Interactive Wall, Glass Table, Preview Screen |
| **Preview** | `preview` | Render output in context frame | Preview Screen, Media Display |
| **Reference Drop** | `reference-drop` | Drop external reference onto surface | Interactive Wall, Glass Table, Asset Shelf |

### Temporal Verbs

| Verb | ID | Description | Primary Objects |
|------|----|-------------|-----------------|
| **Version History** | `version-history` | Scrub through asset versions | Timeline Table, Asset Shelf, Glass Table |

### Communication Verbs

| Verb | ID | Description | Primary Objects |
|------|----|-------------|-----------------|
| **Speak** | `speak` | Voice input to department | Orb Pedestal, Command Console |
| **Orb Conversation** | `orb-conversation` | Natural language dialogue with Orb / AI | Orb Pedestal |

### Navigation Verbs

| Verb | ID | Description | Primary Objects |
|------|----|-------------|-----------------|
| **Navigate** | `navigate` | Move between zones or departments | Entry Portal, Exit Portal |
| **Command** | `command` | Execute registered department command | Command Console, Orb Pedestal |

---

## Verb Schema

```yaml
InteractionVerb:
  id: string
  category: enum         # pointer | decision | content | temporal | communication | navigation
  requiresObject: boolean
  requiresPermission: string | null
  physicalMetaphor: string    # what it feels like
  feedbackProfile: string     # motion + audio reference
  formFallback: boolean       # true = form available as accessibility escape hatch
  genomeStyled: boolean       # feedback styled by Genome
```

---

## Physical Interaction Principles

### 1. Objects Receive Verbs — Not Pages

```
❌  User clicks "Approve" button in modal
✅  User drags asset to Approval Station → stamps approve
```

### 2. Feedback Is Environmental

Every verb produces **environmental feedback**:
- Visual: object animation, lighting shift, particle burst
- Audio: ceremonial sound per Audio Standard
- Haptic: optional on supported devices
- AI: relevant concierge acknowledges action

### 3. Forms Are Escape Hatches

Forms exist only when:
- Verb requires structured data input (scheduling datetime, legal consent)
- Accessibility requirement demands text input alternative
- External API mandates specific field format

Forms appear as **Floating Panels** — never full-page takeovers.

### 4. Multi-Step Work Is Spatial

Complex workflows traverse objects:
```
Asset Shelf → Glass Table (review) → Preview Screen (context) → Approval Station (decide) → Exit Portal (handoff)
```

Not:
```
Step 1 form → Step 2 form → Step 3 form → Submit
```

---

## Interaction Zones and Verb Mapping

Each zone declares `allowedVerbs`. Objects within zones inherit zone verbs plus their own profile.

| Zone | Allowed Verbs |
|------|---------------|
| Entry | `navigate`, `speak` |
| Hero | `preview`, `pin`, `speak` |
| Primary | `click`, `drag`, `pin`, `annotate`, `compare`, `scrub`, `approve`, `reject` |
| Secondary | `click`, `drag`, `preview`, `reference-drop`, `version-history`, `compare` |
| Orb | `speak`, `orb-conversation`, `command` |
| Ceremony | `approve`, `reject`, `branch`, `compare` |
| Exit | `navigate`, `reference-drop` |

---

## Interaction State Machine

Every interactive object maintains state:

```
IDLE → HOVER → FOCUSED → ACTIVE (verb executing) → RESULT (success | error | pending)
                                                      ↓
                                                    IDLE
```

**State rules:**
- Only one `ACTIVE` verb per user at a time within a zone
- `RESULT` triggers feedback profile (motion + audio)
- `pending` state shows on object until async operation completes
- AI employees react to state transitions in their zone

---

## Gesture Support

| Gesture | Maps To | Context |
|---------|---------|---------|
| Single tap | `click` | All objects |
| Long press | Context menu / Orb radial | All objects |
| Drag | `drag` | Movable items |
| Two-finger pinch | `compare` | Glass Table, Preview Screen |
| Swipe horizontal | `scrub` | Timeline Table, Media Display |
| Swipe vertical | `navigate` (zone change) | Department envelope |
| Voice hold | `speak` | Orb Pedestal |

All gestures have keyboard equivalents per platform accessibility requirements.

---

## AI Interaction Collaboration

When a user executes a verb, relevant AI employees respond:

| Verb | AI Response |
|------|-------------|
| `approve` | Brand Concierge confirms; Production Manager updates timeline |
| `reject` | Responsible concierge explains reason; suggests revision path |
| `branch` | Creative Director notes variant intent |
| `compare` | Quality Concierge highlights differences |
| `reference-drop` | Research Concierge catalogs reference |
| `orb-conversation` | Orb routes to specialist concierge if needed |

AI responses are **collaborative overlays** — not modal interruptions.

---

## Interaction Maps

Each department ships an **Interaction Map** — a declarative file binding verbs to objects and zones:

```yaml
interactionMap:
  departmentId: marketing
  version: "1.0.0"
  bindings:
    - verb: approve
      object: launch-approval
      zone: ceremony
      permission: marketing.approve
      feedbackProfile: approval-ceremony
    - verb: scrub
      object: launch-schedule
      zone: primary
      permission: marketing.schedule
      feedbackProfile: timeline-scrub
    - verb: compare
      object: channel-preview
      zone: secondary
      permission: marketing.review
      feedbackProfile: comparison-split
```

Interaction Maps are:
- Generated by FAL Asset Compiler (14) as metadata assets
- Loaded by Department Runtime (11) at assembly time
- Validated by QA Checklist (17)

---

## Forbidden Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Form-first primary workflow | Violates physical interaction principle |
| Modal dialog chains | Breaks spatial continuity |
| Page-level approve buttons | Approvals must be ceremonial at Approval Station |
| Custom hover/click per department | Must inherit platform Interaction Engine™ |
| Silent actions (no feedback) | Every verb produces environmental response |
| AI auto-approve without human verb | Human must execute `approve` verb |

---

## Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Keyboard navigation | Tab between objects; Enter to activate verb |
| Screen reader | Object purpose + available verbs announced |
| Reduced motion | Instant state transitions; no ceremony animation |
| High contrast | Verb feedback visible without color alone |
| Voice alternative | All pointer verbs available via `speak` + Orb |
| Form fallback | Structured input available when verb cannot complete accessibly |

---

_Next: [05 — AI Employee System](./05_AI_EMPLOYEE_SYSTEM.md)_
