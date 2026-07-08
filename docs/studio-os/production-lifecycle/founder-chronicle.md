# Founder Chronicle™ — The Company Autobiography

**System:** Founder Chronicle™  
**Location:** Inside [The Archive™](./archive-system.md)  
**Scope:** Every organization on Studio OS

---

## Purpose

Founder Chronicle™ is the **autobiography of the company**.

Studio OS becomes the living autobiography of the founder's journey — automatically preserving what mattered, what was learned, and what was overcome.

---

## Chronicle Philosophy

| Chronicle™ Is | Chronicle™ Is Not |
|---------------|---------------------|
| Narrative memory | Activity log |
| Significance-filtered | Every click recorded |
| Founder-facing story | Admin audit trail |
| Connected to Archive™ exhibits | Disconnected text file |

---

## Auto-Preserved Moments

Studio OS should automatically preserve:

| Category | Examples |
|----------|----------|
| **Major decisions** | Pinned Founder Notes™ · approval ceremonies |
| **Breakthrough moments** | Creative direction locked · mood wall pivot |
| **Lessons learned** | Validation failures · retry success |
| **Failed experiments** | Abandoned branches · rejected assets |
| **Historic launches** | Product 001 · first Live™ department |
| **First customers** | Revenue milestone · first order |
| **First hires** | Team expansion · AI staff activation |
| **Awards** | External recognition |
| **Acquisitions** | Company integration ceremony |
| **Company anniversaries** | Annual reflection |
| **Founder reflections** | Voice notes · journal entries |

---

## Chronicle Entry Schema

```json
{
  "chronicleEntry": {
    "id": "chronicle-first-golden-build",
    "organizationId": "org-frontal-slayer",
    "title": "Studio OS Alpha Begins — First Golden Build™",
    "narrative": "Today Creative Direction Studio™ became the first Golden Build...",
    "momentType": "golden-build | launch | decision | failure | milestone | reflection | acquisition | anniversary",
    "occurredAt": "ISO8601",
    "capturedAt": "ISO8601",
    "captureSource": "system | founder | ai-braintrust",
    "lifecycleContext": {
      "stage": "golden-build",
      "entityType": "department",
      "entityId": "creative-direction"
    },
    "linkedExhibits": ["archive-exhibit-cds-golden-v1"],
    "linkedAssets": ["asset-env-hero-v1"],
    "founderNoteIds": ["note-..."],
    "media": {
      "previewUrl": "...",
      "walkTheRoomRecordingId": "optional"
    },
    "visibility": "founder | leadership | organization"
  }
}
```

---

## Capture Triggers

| Trigger | Auto-capture |
|---------|--------------|
| Golden Build Gate passed | Yes — "First proof" entry |
| Certification Gate passed | Yes — certification ceremony |
| Live™ launch ceremony | Yes — launch entry |
| Legacy™ ceremony | Yes — preservation entry |
| Founder pins decision | Yes — decision entry |
| Major validation failure → success | Recommended |
| Acquisition integration | Yes |
| Anniversary (system date) | Yes — reflection prompt |
| Founder reflection submitted | Yes |

---

## Chronicle Hall (Archive™)

The primary Chronicle surface inside The Archive™:

```
Chronicle Hall
├── Timeline spine (chronological)
├── Era markers (Founder Journey™ stages)
├── Decision gallery (pinned moments)
├── Failure honor wall (experiments · lessons)
└── Reflection alcove (founder journal)
```

---

## Narrative Voice

Chronicle entries should read as **story**, not system events:

| System log | Chronicle |
|------------|-----------|
| `asset_generation_complete` | "The environment took shape — marble, glass, and the mood wall we'd imagined." |
| `certification_token_issued` | "Creative Direction Studio earned its certification. The room was ready for every founder." |
| `legacy_ceremony` | "We preserved our first headquarters. It lives now in The Archive™." |

AI-assisted narrative drafting permitted — founder approval for publication.

---

## Relationship to Founder Notes™

| Founder Notes™ | Founder Chronicle™ |
|----------------|---------------------|
| Working surface · quick capture | Curated permanent story |
| Department-scoped | Organization-scoped |
| Pin triggers Chronicle review | Published narrative |

Not every note becomes Chronicle. **Significance filter** applies.

---

## Relationship to Founder Journey™

| Journey stage | Chronicle emphasis |
|---------------|-------------------|
| Dreaming | Vision entries · first sketches |
| Building | Golden Builds · breakthroughs |
| Launching | Launch theater content |
| Growing | Milestones · hires · customers |
| Leading | Decisions · acquisitions |
| Legacy | Full timeline · reflection |

---

## Founder Experience

| Access | Experience |
|--------|------------|
| Archive™ Chronicle Hall | Walk timeline · open exhibits |
| Orb in Archive™ | "On this day…" · story mode |
| Mission Control | Chronicle highlights · anniversaries |
| Notification | Anniversary · milestone prompts |

Founder language: *"Read today's Chronicle entry."* · *"What did we decide in March?"*

---

## Privacy and Visibility

| Level | Audience |
|-------|----------|
| `founder` | Founder only |
| `leadership` | Leadership roles |
| `organization` | Full org (future) |

Default for auto-capture: `founder` until founder publishes.

---

## Implementation Note (Future)

Chronicle requires event bus · significance engine · narrative composer · Archive™ linker.

**This document is specification only.**

**Future:** [future-roadmap.md](./future-roadmap.md#chronicle-automation)
