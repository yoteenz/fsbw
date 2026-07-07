# 01 — Experience Overview

**Engine Module:** `studio.walk-the-room.v1.overview`  
**Status:** Canonical experience definition

---

## What Is Walk the Room™?

Walk the Room™ is the **canonical immersive review experience** across every Headquarters, Department, Project, Expansion, Marketplace package, and Studio OS product.

Instead of reading reports, the founder **literally walks through the environment** — with Studio Orb guiding and AI Concierges appearing throughout the space — while every recommendation attaches to the object, interaction, room, workflow, or experience being discussed.

---

## Core Philosophy

> People do not experience businesses as PDFs. People experience places. Studio OS should review work the same way.

Every critique should happen **inside the environment being discussed**.

| Anti-Pattern (Rejected) | Walk the Room (Canonical) |
|---------------------------|----------------------------|
| Review by staring at documents | Review by walking through the place |
| Detached comment threads | Spatial critiques on objects |
| Imagine the revision | Experience the revision live |
| Generic meeting room UI | The department IS the meeting room |
| Overwhelming feedback dump | Intentional narrative walkthrough |

---

## Mission

Design Walk the Room™ as one of Studio OS's **flagship interaction systems**:

1. **Studio Orb** guides the walkthrough
2. **AI Concierges** physically appear throughout the space
3. **Every recommendation** attaches to what it discusses
4. **The room reacts** to previews and Genome changes
5. **The founder decides** with full spatial context
6. **Nothing is forgotten** — Room Memory persists

---

## Purpose

| Purpose | Detail |
|---------|--------|
| **Contextual review** | Critique where the work lives |
| **Spatial understanding** | See flow, friction, delight in situ |
| **Live decision-making** | Preview improvements before committing |
| **Collaborative immersion** | Colleagues at your side, not avatars in a chat |
| **Institutional continuity** | Room remembers every prior walkthrough |
| **Action clarity** | Founder never leaves wondering what happens next |

---

## Participants

| Participant | Role in Walk the Room |
|-------------|----------------------|
| **Founder** | Creative Director walking the space |
| **Studio Orb™** | Guide · moderator · path orchestrator |
| **AI Concierges™** | Physical presence · point · gesture · critique |
| **The Room** | Active participant — reacts to discussion and previews |

---

## Inputs

```yaml
WalkTheRoomInput:
  walkType: enum                   # department | project | campaign | expansion | marketplace | headquarters
  subjectId: string
  subjectVersion: semver | null

  # Critique session binding
  critiqueSessionId: string | null  # links to Critique Sessions engine
  sessionType: CritiqueSessionType | null

  # Environment
  runtimeSessionId: string         # Department Runtime active session
  presentationMode: PresentationModeConfig

  # Context
  companyGenome: CompanyGenomeSnapshot
  projectGenome: ProjectGenomeSnapshot | null
  creativeDirection: CreativeDirectionSnapshot | null
  roomMemory: RoomMemorySnapshot | null

  # Walk config
  pathProfile: WalkthroughPathProfile | null   # auto-resolve if null
  walkScope: enum                  # complete | critical-only | custom-agenda
  founderAgenda: string[] | null
```

---

## Outputs

```yaml
WalkTheRoomOutput:
  walkId: string
  status: enum                     # active | paused | completed | archived

  spatialCritiques: SpatialCritique[]
  walkTranscript: WalkTranscript     # includes movement + dialogue
  livePreviewsApplied: LivePreviewRecord[]
  founderDecisions: FounderDecision[]  # from Critique Sessions 07
  actionItems: ActionItemBundle        # from Critique Sessions 08
  roomMemoryUpdate: RoomMemoryEvent[]

  critiqueSessionHandoff: CritiqueSessionOutput | null
  validationHandoff: ValidationHandoff | null
```

---

## Lifecycle

```
INITIATED
    ↓
PRESENTATION_MODE (arrival · lighting · audio · camera)
    ↓
ORB_WELCOME (scope selection · opportunity summary)
    ↓
WALKTHROUGH (path-driven spatial exploration)
    ├─ Spatial critiques at each stop
    ├─ Live visualization on demand
    ├─ Founder interaction · debate
    └─ Action Mode at each recommendation
    ↓
┌─ PAUSED (founder break — room state preserved)
└─ SUMMARY (Orb final recap · action items)
    ↓
ROOM_MEMORY_PERSIST
    ↓
COMPLETED → Critique Session complete → Validation handoff
```

---

## Relationship Map

### Studio Critique Sessions™

Walk the Room is the **immersive presentation layer** for Critique Sessions:

| Critique Sessions (logic) | Walk the Room (experience) |
|---------------------------|---------------------------|
| Conversation Engine | Spatial dialogue in environment |
| Braintrust Model | Physical concierge presence |
| Debate Engine | Concierges disagree while standing at objects |
| Action Items | Action Mode in situ |
| Memory System | Room Memory (spatial layer) |

A Critique Session may be experienced as Walk the Room **or** (future) other presentation modes. Walk the Room is **canonical** for department and experience review.

### Studio Department Runtime™

Walk the Room requires an **active Runtime session**. The department transitions to Presentation Mode without unloading the world.

### Experience Engine™

Presentation Mode triggers Experience Engine atmosphere controls: lighting dim · ambient quiet · panel density reduced · motion subdued.

### Studio Validation Loop™

Walkthrough spatial evidence enriches Experience Review and Department Review. Completed walks feed Founder Review handoff.

### Creative Direction Studio™

Golden Department reference walkthrough path for creative departments. First flagship Walk the Room experience.

---

## Walk the Room vs Critique Sessions vs Validation

| Dimension | Walk the Room | Critique Sessions | Validation Loop |
|-----------|---------------|-------------------|-----------------|
| Question | What does it feel like here? | How do we make it better? | Should it exist? |
| Medium | Immersive spatial walk | Structured conversation | Pipeline + Scorecard |
| Context | Inside the environment | Dialogue (any presentation) | Automated + founder gate |
| Preview | Live in room | Via Runtime preview session | Runtime preview protocol |

---

## Canonical Statement

> Studio OS should never ask users to review work by staring at documents. Studio OS should invite them to step inside the experience, walk through it, discuss it naturally, preview improvements instantly, and make decisions collaboratively.

---

_Next: [02 — Presentation Mode](./02_PRESENTATION_MODE.md)_
