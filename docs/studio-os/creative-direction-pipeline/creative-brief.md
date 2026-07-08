# Creative Brief™

**Step 01 — The founder describes what they want**

---

## Purpose

Capture founder creative intent in **any form** — Studio OS builds the structured Creative Brief™ automatically.

The founder never fills a form. They **express a vision**.

---

## Input Sources

Everything contributes to the brief:

| Input type | Examples |
|------------|----------|
| **Natural language** | "I want this room to feel like Apple, Pixar, Watch Dogs, and The Movies had a baby." |
| **Images** | Reference photos · brand shots · competitor spaces |
| **Instagram Reels** | Motion · pacing · aesthetic references |
| **Pinterest** | Mood boards · material palettes |
| **Sketches** | Hand-drawn layout ideas |
| **Voice notes** | Spoken creative direction |
| **Screenshots** | UI · film · game · architecture captures |
| **Videos** | Cinematic references · walkthroughs |
| **Packaging** | Physical brand artifacts |
| **Mood boards** | Curated visual clusters |
| **Living Mood Wall™** | In-room pinned references |

---

## Example Brief (Founder Input)

> "I want this room to feel like Apple, Pixar, Watch Dogs, and The Movies had a baby."

Studio OS interprets:

| Reference | Extracted signal |
|-----------|------------------|
| Apple | Minimal luxury · precision · glass · calm confidence |
| Pixar | Warmth · storytelling · creative energy · craft |
| Watch Dogs | Urban edge · cinematic grit · technology atmosphere |
| The Movies | Hollywood production · studio scale · creative industry |

---

## Automatic Brief Construction

Studio OS synthesizes founder input into structured **Creative Brief™**:

```typescript
interface CreativeBrief {
  id: string;
  projectId: string;
  departmentId: string;

  // Founder expression
  rawInputs: BriefInput[];           // all dropped/linked media + text
  founderStatement: string;        // primary natural language intent

  // Synthesized understanding
  emotionalTarget: string[];         // inspired · cinematic · luxurious…
  referenceClusters: ReferenceCluster[];
  antiPatterns: string[];            // things to avoid (from Brand DNA™)
  spatialIntent: string;             // scale · openness · intimacy
  heroFocus?: string;                // what should dominate visually

  // Genome alignment
  companyGenomeSnapshot: string;
  projectGenomeSnapshot: string;
  brandDnaSnapshot: string;
  roomDnaSnapshot: string;

  // Metadata
  createdAt: string;
  status: 'draft' | 'ready' | 'approved';
}
```

---

## Brief Synthesis Rules

| Rule | Meaning |
|------|---------|
| **No forms** | Founder drops · speaks · links — Studio OS structures |
| **Genome-first** | Brief always consults Company · Project · Brand · Room DNA |
| **Reference clustering** | Similar references grouped · conflicts surfaced |
| **Anti-pattern detection** | Brand DNA "never do" rules flagged early |
| **Conversational gaps** | Orb asks follow-ups only when critical signal missing |
| **Auto-save** | Brief evolves as founder adds references |

---

## Orb Role

The Orb may help expand the brief — never interrogate:

> **"That's a powerful combination — precision meets storytelling. Anything else that captures the feeling you want when you walk in?"**

Not:

> ~~"Please complete fields 1–12."~~

---

## Brief → Creative Direction Handoff

When brief reaches `ready` status:

```
Creative Brief™ (structured)
        ↓
Creative Direction™ synthesis
        ↓
Founder confirms creative authority
        ↓
Generate Complete Concepts™ unlocked
```

Founder may approve brief explicitly or implicitly by requesting concepts.

---

## Relationship to Existing Systems

| System | Role |
|--------|------|
| Living Mood Wall™ | In-room brief input surface |
| Inspiration Library | Persistent reference storage |
| Studio Intelligence™ | Brief synthesis reasoning |
| Business Discovery Blueprint™ | Company context (not creative brief) |
| Studio Builder™ | Brief UI surface (future) |

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Empty brief → generate | Must have intent signal |
| Form-only brief capture | Violates natural expression |
| Ignoring dropped media | Every input contributes |
| Brief without genome consult | Concepts will drift from brand |

---

## Cross-References

- [creative-direction.md](./creative-direction.md)
- [complete-concepts.md](./complete-concepts.md)
- [Golden Department — Brief Wall](../golden-department/creative-direction-studio/)
