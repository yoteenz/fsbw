# 10 — Company Genome Integration

**SDK Module:** `studio.department.sdk.v1.genome`  
**Status:** Identity injection specification — **most critical SDK document**  
**Parent:** [Company Genome™ M277](../company-genome.md)  
**Philosophy:** Departments NEVER define branding. Company Genome injects everything.

---

## Core Principle

> **The same department must transform into a Luxury Hair Brand, Law Firm, Medical Practice, Construction Company, Architecture Firm, Fashion House, or Recording Studio — without rebuilding the department.**

Departments are **identity-neutral vessels**. Company Genome™ is the **identity engine**. This separation is the single most important architectural rule in the entire SDK.

---

## What Departments Define vs. What Genome Injects

| Departments Define | Genome Injects |
|-------------------|----------------|
| Spatial topology | Room materials and colors |
| Object class placement | Object surface appearance |
| Interaction verbs | Interaction feedback style |
| AI role assignments | AI personality and voice |
| Zone boundaries | Zone atmosphere and lighting |
| Workflow structure | Terminology and labels |
| Asset module slots | Asset material values |
| Camera positions | — (structural, not branded) |
| Motion profile structure | Motion pacing and drama |
| Audio category structure | Audio content and character |

**Forbidden in departments:** hex colors, font names, logo files, brand photography, voice scripts, music tracks, material textures with brand identity, industry-specific copy.

---

## Genome Injection Pipeline

```
Company Genome™ (living DNA)
         ↓
Genome Resolver (runtime service)
         ↓
Domain → Target Mapping (genome hooks from anatomy)
         ↓
Material Shader Injection
Typography Injection
Lighting Parameter Injection
Audio Asset Selection
AI Personality Configuration
Terminology Override
         ↓
Assembled Department (unique per company)
```

Injection occurs at **Department Runtime assembly** — not at asset generation time.

---

## Mandatory Genome Domains

Every department MUST declare hooks for all domains below. Runtime injects available values; empty domains use SDK defaults.

### Visual Domains

| Domain | Injects Into | Default Fallback |
|--------|-------------|------------------|
| `colorPrinciples` | All material slots, particle color, glass tint, light accent | Neutral warm gray palette |
| `materialLanguage` | Environment, furniture, glass, surfaces | Matte white + clear glass |
| `lightingStyle` | Light anchor temperature, intensity, IBL selection | Soft warm key + cool fill |
| `spatialDesign` | Object spacing multiplier, furniture scale | Standard spacing (1.0×) |
| `visualPhilosophy` | Style register selection (luxury/editorial/minimal) | Editorial |
| `photographyDirection` | Mood Wall imagery selection | Abstract texture |
| `artDirection` | Object arrangement density, hero composition | Balanced |
| `editorialDirection` | Panel typography, text hierarchy | Clean sans-serif |
| `worldBuilding` | Architectural style, furniture presence | Contemporary |

### Sensory Domains

| Domain | Injects Into | Default Fallback |
|--------|-------------|------------------|
| `musicStyle` | Ambient environment audio selection | Room tone only |
| `soundDesign` | Feedback sounds, notification character | Soft taps |
| `motionPhilosophy` | Easing curves, ceremony drama level | Standard cinematic |
| `pacing` | All motion duration scaling factor | 1.0× |

### Identity Domains

| Domain | Injects Into | Default Fallback |
|--------|-------------|------------------|
| `personality` | Orb skin, AI employee tone | Warm professional |
| `voice` | Orb TTS parameters, AI speech style | Clear neutral |
| `microcopyStyle` | Panel labels, command text, button copy | Sentence case, concise |
| `terminology` | Department display name, role titles, command labels | SDK defaults |
| `brandEmotions` | Mood Wall mood, ambient intensity, particle character | Calm confidence |
| `signatureMoments` | Approval sound, celebration sound, ceremony motion | SDK ceremony defaults |
| `signatureAnimations` | Celebration particles, genome refresh animation | Standard burst |
| `signatureInteractions` | Preferred interaction feedback style | Standard feedback |

### Constraint Domains

| Domain | Injects Into | Default Fallback |
|--------|-------------|------------------|
| `thingsWeNeverDo` | AI veto rules, Quality Concierge sensitivity | Platform minimums |
| `thingsWeLove` | AI recommendation bias, reference suggestions | None |
| `competitors` | Research Concierge context | None |
| `aspirationalBrands` | Creative Director reference suggestions | None |
| `visualReferences` | Mood Wall content, Interactive Wall suggestions | Abstract |

### Knowledge Domains

| Domain | Injects Into | Default Fallback |
|--------|-------------|------------------|
| `coreBeliefs` | AI employee knowledge emphasis | None |
| `values` | AI decision weighting | None |
| `products` | Asset Shelf default content, Preview Screen context | None |
| `interactionStyle` | Feedback intensity, AI proactivity level | Balanced |

---

## Transformation Examples

### Same Marketing Department — Four Companies

| Element | Luxury Hair Brand | Law Firm | Medical Practice | Construction Co. |
|---------|-------------------|----------|------------------|------------------|
| Environment material | Polished marble, brass | Dark walnut, leather | Clean white, soft wood | Concrete, steel |
| Glass tint | Warm rose gold | Cool blue-gray | Clear clinical | Amber safety |
| Mood Wall | Editorial hair photography | Law library atmosphere | Calming nature | Job site aerial |
| Ambient audio | Soft strings | Room tone, quiet | Gentle nature filter | Low industrial hum |
| Orb voice | Warm, enthusiastic | Measured, authoritative | Calm, reassuring | Direct, practical |
| Typography | Elegant serif headlines | Traditional serif | Clean sans-serif | Bold sans-serif |
| Approval sound | Crystal chime | Gavel tap | Soft bell | Impact stamp |
| Terminology | "Campaign Launch" | "Publication Release" | "Patient Communication" | "Project Announcement" |
| AI personality | Creative, trend-aware | Precise, risk-aware | Empathetic, careful | Practical, safety-first |
| Spacing | Generous (1.3×) | Structured (1.0×) | Open (1.2×) | Compact (0.8×) |

**Zero department rebuild.** Same anatomy, same objects, same zones, same verbs. Only Genome values change.

---

## Genome Hook Implementation

### Hook Declaration (in Department Anatomy)

```yaml
genomeHooks:
  - domain: colorPrinciples
    targets: [all-materials, particles, glass-tint, light-accent]
    priority: 1
    fallback: sdk-default-palette
  - domain: materialLanguage
    targets: [environment, furniture, glass, surfaces]
    priority: 1
    fallback: sdk-default-materials
  - domain: voice
    targets: [orb, marketing-concierge, brand-concierge]
    priority: 2
    fallback: sdk-default-voice
  - domain: terminology
    targets: [displayName, command-labels, panel-headers]
    priority: 3
    fallback: sdk-default-terminology
```

### Runtime Injection Contract

```yaml
GenomeInjection:
  hookId: string
  domain: string
  target: string
  resolvedValue: any          # from Company Genome
  appliedAt: datetime
  fallbackUsed: boolean
```

Runtime logs every injection for audit. `fallbackUsed: true` triggers gentle Genome enrichment suggestion via Orb.

---

## Genome Update Behavior

When Company Genome™ updates while a department is active:

| Update Type | Department Response |
|-------------|---------------------|
| Color change | Material crossfade (2s per Visual Language) |
| New visual reference | Mood Wall crossfade (2s) |
| Voice change | AI employees adopt on next speech |
| Terminology change | Panel labels update immediately |
| New product | Asset Shelf refreshes content |
| thingsWeNeverDo addition | Quality Concierge + Brand Concierge sensitivity increases |
| Signature moment change | Next ceremony uses new sound/motion |

**Motion profile:** `genome-refresh` (see Motion Standard 08).

---

## Genome Learning Outputs

Departments **teach** Company Genome through `genome-learning` output ports:

| Learning Type | Source | Genome Domain |
|---------------|--------|---------------|
| Approved creative style | Approval Station | `thingsWeLove` |
| Rejected approach | Reject verb | `thingsWeNeverDo` |
| Preferred terminology | Command usage patterns | `terminology` |
| Campaign performance signal | Output port metadata | `products` |
| Reference preferences | Pin patterns on Interactive Wall | `visualReferences` |
| Interaction preferences | Verb frequency analysis | `interactionStyle` |

Learning is **suggestive** — human founder approves Genome mutations.

---

## Project Genome™ Layer

When a Project is active inside a department, **Project Genome™** (M278) overlays Company Genome:

```
Company Genome™ (company-wide identity)
         ↓
Project Genome™ (project-specific intent)
         ↓
Department Runtime (project-scoped injection)
```

Project Genome may override:
- Mood Wall content (project mood)
- AI employee focus (project-specific knowledge)
- Preview Screen context (project output format)
- Timeline Table events (project schedule)

Project Genome never overrides Company Genome constraints (`thingsWeNeverDo`, brand veto rules).

---

## Marketplace Implications

Marketplace packages ship **without branding**:

| Included | Excluded |
|----------|----------|
| Anatomy manifest | Company colors |
| Asset modules (neutral) | Brand photography |
| Interaction maps | Voice recordings |
| AI role definitions | Custom terminology |
| Genome hook declarations | Logo files |
| Genome rules (which domains adapt what) | Industry-specific copy |

Installation into a new company triggers full Genome injection automatically.

---

## Validation Rules

| Check | Requirement |
|-------|-------------|
| No hardcoded colors in any asset | ✓ |
| No hardcoded fonts in any panel definition | ✓ |
| No brand logos in asset files | ✓ |
| All 20+ mandatory domains have hooks declared | ✓ |
| Fallback defined for every hook | ✓ |
| Department transforms across 3+ industry Genomes in QA | ✓ |
| AI employees use Genome voice, not hardcoded scripts | ✓ |
| Terminology overridable by Genome | ✓ |

---

## Forbidden Patterns

| Pattern | Why Forbidden |
|---------|---------------|
| Department with brand colors | Genome owns all color |
| Department with custom fonts | Genome owns typography |
| Department with logo in asset | Genome provides logo at runtime |
| Department with industry-specific copy | Genome `terminology` adapts labels |
| Department that looks identical across companies | Genome injection failure |
| Skipping genome hooks | Department cannot adapt |
| Branding in FAL generation prompts | FAL generates neutral assets only |

---

_Next: [11 — Department Runtime](./11_DEPARTMENT_RUNTIME.md)_
