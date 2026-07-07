# 10 — Genome Injection

**Engine Module:** `studio.department-generator.v1.genome-injection`  
**Status:** Company Genome transform system  
**Philosophy:** The Generator never hardcodes branding. Everything inherits from Company Genome™.

---

## Design Principle

> Same Department DNA + different Company Genome = **completely different environment** — same topology, different soul.

---

## Injection Model

```
Fixed (Department DNA)
├── Zone topology
├── Object classes
├── Interaction verbs
├── Ceremony structure
└── AI role roster

Variable (Genome-injected)
├── Materials & textures
├── Lighting temperature
├── Exterior view plate
├── Typography on objects
├── Particle character
├── Audio stems
├── Orb voice register
├── Mood surface character
└── Observatory visualization palette
```

**Compile-time:** Genome values flow into every prompt stack.  
**Runtime:** Genome hot-swaps shader slots and audio stems without rebuild.

---

## Genome Domain Map

| Genome Domain | Compiler Targets |
|---------------|------------------|
| `mission` | Brief Wall seeds · Observatory core |
| `values` | Observatory ring nodes |
| `brandDNA` | Material samples · decor |
| `experienceDNA` | Motion trails · ceiling kinetic |
| `voice` | Orb audio · Concierge tone |
| `photographyDirection` | Mood Wall character |
| `lightingStyle` | Lighting rig weights |
| `materialLanguage` | Floor · walls · furniture |
| `editorialDirection` | Typography · pin style |
| `customerEmotions` | Ambient audio · particle warmth |
| `visualReferences` | View plate · seed references |

---

## Slot Binding Schema

```yaml
GenomeSlotBinding:
  slotId: string
  genomeField: string
  compileTargets: string[]        # task IDs receiving injection
  runtimeTargets: string[]        # shader · audio · voice slots
  fallback: string | null         # used when Genome field empty
  transformType: enum             # prompt-modifier | shader-param | audio-stem | voice-profile
```

Every compile task must declare ≥1 slot binding.

---

## Company Transform Examples

### Frontal Slayer (Luxury Beauty Mansion)

| Element | Genome Expression |
|---------|-------------------|
| Floor | Warm Calacatta marble · soft reflection |
| Walls | Gallery white · rose-gold pin rails |
| Windows | Garden terrace · golden hour |
| Mood Wall | Editorial beauty · texture · packaging |
| Orb voice | Warm · confident · beauty-founder |
| Particles | Soft gold dust |
| Audio | Faint salon ambience |

**Founder feels:** *"I've entered a luxury beauty mansion."*

### NDX (Premium Editorial Financial Think Tank)

| Element | Genome Expression |
|---------|-------------------|
| Floor | Polished concrete · precise line |
| Walls | Dark walnut · frosted glass |
| Windows | Abstract horizon · cloud drift |
| Mood Wall | Financial editorial · typography-led |
| Orb voice | Measured · authoritative |
| Particles | Suppressed |
| Audio | Cool quiet room |

**Founder feels:** *"I've entered a premium editorial think tank."*

### Restaurant (Culinary Innovation Studio)

| Element | Genome Expression |
|---------|-------------------|
| Floor | Wide-plank warm oak |
| Walls | Copper accents · open shelving metaphor |
| Windows | Market district morning light |
| Mood Wall | Food photography · plating |
| Orb voice | Sensory · evocative |
| Particles | Warm spice-toned motes |
| Audio | Subtle kitchen ambience |

### Law Firm (Sophisticated Legal Strategy HQ)

| Element | Genome Expression |
|---------|-------------------|
| Floor | Dark herringbone wood |
| Walls | Mahogany paneling · leather texture |
| Windows | Library courtyard |
| Mood Wall | Case study · authority references |
| Orb voice | Formal · strategic |
| Particles | Minimal |
| Audio | Library hush |

---

## Cross-Department Consistency

| Invariant | All Companies |
|-----------|---------------|
| Zone positions | ✓ Same per DNA |
| Orb pedestal location | ✓ Same coordinates |
| Primary work surface | ✓ Same object class |
| Sandbox isolation | ✓ Same behavior |
| Approve ceremony structure | ✓ Same runtime contract |
| Arrival phases | ✓ Same structure · different assets |

---

## Genome Update Mid-Lifecycle

| Phase | Generator/Runtime Response |
|-------|---------------------------|
| Detect change | Observatory pulse · QA warn |
| Materials | Shader crossfade 2s |
| Lighting | Temperature shift 1.5s |
| Audio | Stem crossfade 1s |
| Mood Wall | Optional founder confirm if direction conflict |

Regeneration scope: materials + lighting + audio — not full department (14).

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| `#EB1C24` in texture prompts | Genome accent slot |
| Company name in architecture mesh | Brief Wall content plane |
| CSS theme swap | Material shader swap |
| One-size-fits-all audio | Genome stem selection |

---

## Validation

| Test | Pass |
|------|------|
| Blind room test | Founder identifies company without text |
| Switch test | Same DNA · two Genomes · two headquarters |
| Slot coverage | Every compile task has Genome binding |
| Runtime hot-swap | Shader crossfade without pop |

---

_Next: [11 — Asset Compiler Handoff](./11_ASSET_COMPILER_HANDOFF.md)_
