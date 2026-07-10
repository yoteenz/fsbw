# Project DNA Model

**Protocol module:** L2 — Institutional memory  
**Capsule path:** `StudioOS/dna.json`  
**Source:** Expands [PROJECT_DNA.md](../PROJECT_DNA.md)  
**Purpose:** Every project develops DNA — principles from which everything derives.

---

## Purpose

Project DNA encodes **why Studio OS exists** and the **immutable philosophical traits** that govern design, architecture, and AI collaboration.

Receiving AI uses Project DNA to evaluate whether proposals belong in the civilization.

---

## dna.json schema

```json
{
  "schemaVersion": 1,
  "generatedAt": "ISO-8601",
  "projectName": "Studio OS",
  "hostDeployment": "Frontal Slayer (Build-a-Wig)",
  "dnaVersion": "1.0.0",
  "traits": [
    {
      "id": "luxury",
      "label": "Luxury",
      "description": "Executive environments feel premium — not utilitarian admin",
      "manifestations": ["Graphics-first IA", "Spatial navigation", "Calm density"]
    },
    {
      "id": "futuristic",
      "label": "Futuristic",
      "description": "Platform feels ahead of commerce SaaS — living OS, not dashboard",
      "manifestations": ["Studio World geography", "Digital staff", "Living systems"]
    },
    {
      "id": "elegant",
      "label": "Elegant",
      "description": "Complexity hidden behind coherent places and clear canon",
      "manifestations": ["District addresses", "Consistent terminology", "Surgical UI changes"]
    },
    {
      "id": "educational",
      "label": "Educational",
      "description": "Institute woven through the city — learning is ambient",
      "manifestations": ["Learning DNA", "Professors in places", "Knowledge Graph"]
    },
    {
      "id": "world-driven",
      "label": "World-driven",
      "description": "Navigation asks where to go, not which menu to open",
      "manifestations": ["Studio Atlas", "Place over menu", "Geographic IA"]
    },
    {
      "id": "simulation-first",
      "label": "Simulation-first",
      "description": "Experience Lab and compile pipeline prove before ship",
      "manifestations": ["World Compiler", "Layer validation", "Forensic failures"]
    },
    {
      "id": "living-systems",
      "label": "Living systems",
      "description": "Headquarters grows — infill districts, not redesign",
      "manifestations": ["Genesis constitution", "Organizational memory", "Civilization layer"]
    },
    {
      "id": "architecture-first",
      "label": "Architecture-first",
      "description": "Constitution before implementation; spec before sprint",
      "manifestations": ["Genesis Core", "Decision memory", "AI Context Protocol"]
    },
    {
      "id": "visual-storytelling",
      "label": "Visual storytelling",
      "description": "Maps, environments, and graphics carry meaning",
      "manifestations": ["Studio Atlas", "Executive summaries", "Spatial metaphors"]
    }
  ],
  "coreBeliefs": [
    { "belief": "Place over menu", "implication": "Every feature needs a Studio World address" },
    { "belief": "Canon over convenience", "implication": "Temporary hacks need explicit expiry" },
    { "belief": "Forensic over retry", "implication": "Failures visible and proven before repair" },
    { "belief": "Mobile over desktop", "implication": "Real phone verification is default" },
    { "belief": "Governance over generation", "implication": "Material assets require authorization" },
    { "belief": "Memory over repetition", "implication": "Context persists via capsule and protocol" }
  ],
  "whatItIsNot": [
    "Generic admin dashboard",
    "Feature subscription marketplace",
    "Chatbot bolted onto CRUD",
    "Single-brand website without platform layer"
  ],
  "relationships": {
    "frontalSlayer": "Host deployment and first live organization",
    "studioWorld": "Spatial projection — users travel, not click",
    "genesis": "Constitutional DNA — law, not lore",
    "institute": "Learning woven through city — not isolated LMS",
    "aiCollaboration": "Capsule + Protocol = portable institutional memory"
  },
  "longHorizonIntent": "Ten-year coherence via infill districts. Every capability answers: Where does this live?",
  "derivationRule": "All features, docs, and AI outputs should trace to at least one trait and one core belief.",
  "sourceRef": "docs/ai-collaboration/PROJECT_DNA.md"
}
```

---

## Trait → system mapping (seed)

| Trait | Primary systems |
|-------|-----------------|
| World-driven | Studio Atlas, Studio World, navigation |
| Simulation-first | World Compiler, Experience Lab, Scene Stack |
| Architecture-first | Genesis Core, AI Context Protocol, Canon Engine |
| Educational | Studio Institute, Learning DNA, Knowledge Graph |
| Living systems | Organizational memory, Institutional Memory Engine |

Memory graph links traits to nodes via `implements` / `expresses` edges.

---

## Relationship to capsule v2

| v2 path | v3 path |
|---------|---------|
| `StudioOS/project-dna.md` | Human-readable prose (retained) |
| — | `StudioOS/dna.json` — structured traits + beliefs |

---

## AI usage contract

Before proposing features:

1. Map proposal to ≥1 trait and ≥1 core belief  
2. Answer "Where does this live?" in Studio World  
3. Reject proposals that violate `whatItIsNot` without founder override  
4. Cite conflicting traits in onboarding report if handoff suggests tension  

---

*Protocol module — specification only*
