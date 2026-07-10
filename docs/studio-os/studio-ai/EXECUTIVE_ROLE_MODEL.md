# Executive Role Model

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Principle:** Studio AI maintains **roles**, not model identities.

---

## Purpose

Define persistent AI employee roles that survive foundation model changes. When the engine upgrades, **Creative Director is still Creative Director**.

---

## Role vs engine vs persona

| Concept | Definition | Survives succession? |
|---------|------------|----------------------|
| **Role** | Executive function + mandate + memory scope | ✅ Yes |
| **Persona overlay** | Voice/style tuning per role | ✅ Yes |
| **Reasoning engine** | Foundation model + adapter | ❌ Replaceable |
| **Session** | One conversation instance | ❌ Ephemeral |

---

## Canonical roles (seed registry)

### Executive suite

| roleId | Title | Mandate | Default memory scope |
|--------|-------|---------|----------------------|
| `creative-director` | Creative Director | Vision, sprint design, architecture exploration, Composer prompt authoring | Full DNA + handoff + graph + decisions |
| `chief-architect` | Chief Architect | System boundaries, Genesis alignment, cross-district design | Architecture + canon + graph |
| `research-director` | Research Director | Deep bible synthesis, competitive research, long-form specs | Bibles index + timeline |
| `marketing-strategist` | Marketing Strategist | Brand, campaigns, Frontal Slayer voice, customer-facing copy | Brand canon + Project DNA |

### Institute professors (Studio World)

| roleId | Title | Mandate | District |
|--------|-------|---------|----------|
| `professor-atlas` | Professor Atlas | Geography, Studio World, spatial IA, Atlas | Studio Atlas |
| `professor-motion` | Professor Motion | Animation, compile pipeline, Experience Lab, World Compiler | Experience Lab / Works |
| `professor-signal` | Professor Signal | Intelligence, Knowledge Graph, inference, data flow | Institute / Signal |
| `professor-palette` | Professor Palette | Visual language, design DNA, Genesis Orb aesthetics | Design / Council |

---

## Role schema (future registry)

```json
{
  "roleId": "creative-director",
  "title": "Creative Director",
  "category": "executive | professor",
  "mandate": "Vision, sprint design, architecture exploration",
  "memoryScope": {
    "include": ["Founder/dna.json", "CurrentSprint/handoff.md", "Graph/memory-graph.json", "History/decisions.json"],
    "exclude": ["raw-chat-logs"]
  },
  "personaOverlayId": "executive-creative",
  "defaultEnginePreference": null,
  "canInvokeTools": ["export-capsule-spec", "draft-composer-sprint"],
  "reportsTo": "founder",
  "studioWorldAddress": "Studio Headquarters / Executive Council",
  "successionInvariant": true
}
```

---

## Role assignment

- **Default session role:** Creative Director  
- **Founder explicit switch:** "Professor Atlas, explain the Knowledge Graph"  
- **Automatic handoff:** Implementer tasks → suggest Cursor/Composer role (external today)  
- **Multi-role sessions:** Session Director tracks active role; one primary speaker  

Roles are **never** named after vendors ("ChatGPT mode" is forbidden in product copy).

---

## External mapping (interim)

Until native Studio AI runtime:

| Studio AI role | Current external host |
|----------------|----------------------|
| Creative Director | ChatGPT + capsule |
| Implementer (adjacent) | Cursor Composer + motherboard |
| Governance | Terra prompts / canon review |
| Professors | ChatGPT with role-labeled prompts |

Mapping is **temporary host assignment**, not role definition.

---

## Succession behavior

On engine upgrade:

1. Role Registry snapshot included in succession bundle  
2. Each role's `memoryScope` re-imported  
3. Verification probes run **per critical role** (minimum: Creative Director + active role)  
4. Role titles and mandates unchanged in UI and copy  

---

## Role expansion rules

New roles require:

- Studio World address  
- Mandate statement  
- Memory scope definition  
- Persona overlay (or inherit default)  
- Changelog + decision memory entry  
- Founder approval  

Professors must connect to Institute / Knowledge Graph canon.

---

## Relationship to Genesis Orb

Orb state reflects **active role activity** (thinking, speaking, compiling) — not engine brand.

Professor Motion active during compile → Orb compiler accumulation visual — role is Motion, engine is invisible.

---

*Architecture specification only*
