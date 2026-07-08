# Director Feedback™

**Natural language creative direction — not prompt engineering**

---

## Purpose

Define how founders direct refinements through **natural language** — Studio OS converts intent into generation instructions.

The founder never writes prompts. The founder **directs**.

---

## Core Law

**Founders speak like Creative Directors. Studio OS speaks like a production studio.**

---

## Example Feedback

| Founder says | Studio OS understands |
|--------------|----------------------|
| "Larger." | Scale node + adjust adjacency in blueprint |
| "Warmer." | Color temperature ↑ · lighting intent shift |
| "Less marble." | Material weight redistribution |
| "More cinematic." | Contrast ↑ · depth ↑ · lighting drama |
| "Increase luxury." | Material tier ↑ · finish quality ↑ |
| "Feels too corporate." | Anti-SaaS correction · warmth injection |
| "Move the Orb closer." | Position update · relationship edge change |
| "Make the Mood Wall the hero." | focalPoints reorder · lighting emphasis |
| "Use more Frontal Slayer branding." | Brand DNA injection · accent application |

---

## Feedback Processing Pipeline

```
Director Feedback™ (natural language)
        ↓
Intent classification
        ↓
Target node identification (from tap context)
        ↓
Scene Blueprint™ diff computation
        ↓
Genome consultation
        ↓
Prompt Compiler™ → ExpandedPromptStack
        ↓
Dependency impact analysis
        ↓
Generation instruction ready
```

---

## Intent Categories

| Category | Example phrases | Affects |
|----------|-----------------|---------|
| **Scale** | larger · smaller · taller · wider | Node scale · zone proportions |
| **Temperature** | warmer · cooler · colder | Color · lighting |
| **Material** | more marble · less glass · wood | Material nodes |
| **Mood** | cinematic · corporate · cozy · dramatic | Atmosphere · lighting |
| **Luxury** | increase luxury · more premium | Finish tier · detail density |
| **Position** | move closer · shift left · center | Node transform · relationships |
| **Hierarchy** | make hero · de-emphasize | focalPoints · lighting |
| **Brand** | more branding · our colors | Brand DNA application |
| **Density** | more minimal · more rich | Object count · decor density |

---

## Multi-Intent Parsing

Founders often combine intents:

> **"Warmer and more cinematic with less marble."**

Studio OS parses:

```typescript
{
  targets: ['node-mood-wall-cds'],
  intents: [
    { type: 'temperature', direction: 'warmer' },
    { type: 'mood', value: 'cinematic' },
    { type: 'material', material: 'marble', direction: 'reduce' }
  ]
}
```

---

## Orb Conversation During Refinement

Orb facilitates — never demands prompt syntax:

> **"I'll warm the Mood Wall™ and reduce the marble weight. The lighting may shift slightly — shall I update reflections too?"**

Not:

> ~~"Enter your prompt below."~~

---

## Director's Notes™

Persistent notes from refinement sessions flow to:

| Destination | Purpose |
|-------------|---------|
| **Project Genome™** | `creativeDirectionNotes` |
| **Director's Notes store** | Session history |
| **Future Braintrust™** | Context for next refinement |
| **Memory Engine™** | "Founder prefers warmer lighting" |

Preserved from Creative Approval Pipeline™ implementation.

---

## Feedback → Prompt Compilation

Director Feedback™ never exposes raw prompts to founder.

```
Founder: "More cinematic"
        ↓
Prompt Compiler™ merges:
  - Director Feedback intent
  - Scene Blueprint™ node context
  - Company · Project · Brand · Room DNA
  - Creative Direction™ law
  - Previous approved version (for consistency)
        ↓
ExpandedPromptStack (internal only)
        ↓
Generation Manager™ executes
```

---

## Clarification (When Needed)

Orb asks only when ambiguous:

| Ambiguous | Orb clarifies |
|-----------|---------------|
| "Change it" | "The Mood Wall™ or the lighting?" |
| "Bigger" (whole room) | "The entire room or the Story Table™?" |
| "Fix it" | "What feels wrong — scale · color · or position?" |

One clarification — not an interrogation.

---

## Anti-Patterns

| Anti-pattern | Why |
|--------------|-----|
| Expose raw prompts | Founder is not prompt engineer |
| Require technical vocabulary | Natural language only |
| Ignore tap context | Feedback applies to selected node |
| Drop genome on regen | Brand drift |

---

## Cross-References

- [refinement-pipeline.md](./refinement-pipeline.md)
- [production-intelligence.md](./production-intelligence.md)
- [Prompt Compiler™](../alpha/studio-builder/production-flow.md)
