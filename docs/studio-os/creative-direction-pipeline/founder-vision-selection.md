# Founder Selects Vision™

**Step 04 — The founder becomes Creative Director**

---

## Purpose

The founder chooses which complete concept becomes the **approved vision** for all downstream production.

The question is never "approve this wall."  
The question is:

> **"Which direction excites me the most?"**

---

## Selection Options

| Option | Result |
|--------|--------|
| **Select Concept A** | Vision A locked · A's Scene Blueprint™ becomes production truth |
| **Select Concept B** | Vision B locked |
| **Select Concept C** | Vision C locked |
| **Request more directions** | Generate additional concepts (D · E…) with guidance |
| **Blend directions** | "Take A's lighting with B's layout" → synthesis concept |
| **Return to brief** | Unlock Creative Direction™ for revision |

---

## Vision Lock

On selection:

```typescript
interface ApprovedVision {
  id: string;
  conceptId: 'A' | 'B' | 'C' | string;
  sceneBlueprintId: string;
  renderedImageRef: string;
  lockedAt: string;
  lockedBy: 'founder';

  // Preserved alternatives
  rejectedConcepts: ConceptArchive[];
  founderSelectionReason?: string;  // optional voice/text
}
```

**Vision Lock** gates:
- Reverse Engineering™
- Asset Graph™ construction
- Refinement Pipeline™
- Golden Build™ path

---

## Founder Experience

| Forbidden feeling | Required feeling |
|-------------------|------------------|
| "I'm picking a template" | "I'm choosing my company's creative direction" |
| "Which image is best?" | "Which world do I want to inhabit?" |
| "Technical comparison" | "Emotional excitement" |

Orb confirms with warmth:

> **"Excellent choice. Concept B will become the foundation of your Creative Atelier™."**  
> **"I'll now deconstruct this vision and prepare it for refinement."**

---

## Rejected Concept Archive

Non-selected concepts are **archived** — not deleted:

| Use | Value |
|-----|-------|
| Branch™ later | Founder may revisit rejected directions |
| Project Genome™ | Creative exploration history |
| Memory Engine™ | "We considered C but chose B because…" |
| Marketplace | Anonymized concept patterns (future) |

---

## Blend Requests

When founder wants hybrid:

> **"I love A's atmosphere but B's furniture arrangement."**

Studio OS:
1. Reads both Scene Blueprints™
2. Synthesizes blend specification
3. Generates **Concept D** (blend)
4. Returns to selection

Never manually composite in founder-facing flow.

---

## Relationship to Creative Review™

Vision selection is **founder authority** — Braintrust may advise but not block:

```
Concepts presented
        ↓
Braintrust™ optional advisory (not gate)
        ↓
Founder Selects Vision™ (founder authority)
        ↓
Reverse Engineering™ begins
```

Braintrust **does** gate refinements — not initial vision selection.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Force Braintrust before selection | Founder is Creative Director |
| Delete rejected concepts | Lose creative history |
| Selection without blueprint | No production truth |
| Multi-select | One vision · one truth |

---

## Cross-References

- [complete-concepts.md](./complete-concepts.md)
- [reverse-engineering.md](./reverse-engineering.md)
- [scene-blueprint.md](./scene-blueprint.md)
