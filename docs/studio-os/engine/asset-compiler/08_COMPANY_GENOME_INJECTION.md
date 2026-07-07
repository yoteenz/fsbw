# 08 — Company Genome Injection

**Engine Module:** `studio.asset-compiler.v1.genome-injection`  
**Status:** Genome-driven visual derivation specification  
**Philosophy:** The compiler never hardcodes visuals — everything comes from Company Genome

---

## Core Principle

> The exact same compiler, compiling the exact same Creative Direction department, must produce completely different assets for NDX, Frontal Slayer, an Architecture Studio, a Medical Office, a Law Firm, a Construction Company, and a Hair Salon.

Genome injection happens at **two stages**:

| Stage | What Happens |
|-------|-------------|
| **Compile-time** (Prompt Compiler) | Genome domains flow into prompt layers — influences generation character |
| **Runtime** (Department Runtime) | Genome values fill material/lighting/audio slots — final brand expression |

The compiler generates **Genome-ready assets** with empty slots. Genome fills slots at runtime. Compile-time injection ensures generated geometry, atmosphere, and character align with brand principles.

---

## Injection Architecture

```
Company Genome™ Snapshot
         ↓
Genome Resolver (maps domains → compiler variables)
         ↓
┌────────────────────────────────────────────┐
│  COMPILE-TIME INJECTION                     │
│  Prompt layers · material hints · atmosphere│
│  audio character · motion pacing · mood     │
└────────────────────┬───────────────────────┘
                     ↓
            Generated Assets (Genome-ready slots)
                     ↓
┌────────────────────────────────────────────┐
│  RUNTIME INJECTION (Department Runtime)     │
│  Shader values · typography · voice ·     │
│  lighting params · audio selection · labels │
└────────────────────────────────────────────┘
```

---

## Genome Domains → Compiler Injection Map

| Genome Domain | Compile-Time Effect | Runtime Effect |
|---------------|--------------------|--------------------|
| **Typography** | — | Panel fonts, labels, command text |
| **Materials** (`materialLanguage`) | Material family selection, surface character in prompts | Shader slot values |
| **Lighting** (`lightingStyle`) | Light temperature, drama level in prompts | Light rig parameters |
| **Products** | Asset shelf default content hints | Shelf content hydration |
| **Brand Colors** (`colorPrinciples`) | Color character in prompts (natural language) | Particle, glass, accent colors |
| **Terminology** | — | Department name, command labels |
| **Motion** (`motionPhilosophy`, `pacing`) | Animation duration scaling | Motion profile speed |
| **Photography** (`photographyDirection`) | Mood Wall imagery style in prompts | Mood Wall content |
| **Voice** (`voice`, `personality`) | — | AI TTS parameters |
| **Audio** (`musicStyle`, `soundDesign`) | Ambient genre, SFX character in prompts | Audio file selection |
| **UI Style** (`interactionStyle`) | Feedback intensity in interaction metadata | Interaction feedback style |
| **Mood** (`brandEmotions`) | Atmosphere weight, particle character | Mood Wall, ambient intensity |
| **Visual References** | Mood Wall, decor, material texture references | Interactive Wall suggestions |
| **Industry** (via Industry DNA) | Spatial conventions, material affinities | Terminology, AI knowledge |

---

## Transformation Examples

### Same Creative Direction Department — Six Companies

| Element | NDX (Media) | Frontal Slayer (Luxury Hair) | Architecture Studio | Medical Office | Law Firm | Construction Co. |
|---------|-------------|------------------------------|---------------------|----------------|----------|-------------------|
| **Environment** | Modern media loft, exposed brick | Polished marble, brass accents | Minimal concrete gallery | Clean white clinical | Dark walnut library | Industrial concrete steel |
| **Material family** | Brick, glass, metal | Marble, crystal, velvet | Concrete, glass, steel | White, soft wood, linen | Walnut, leather, brass | Concrete, steel, amber glass |
| **Mood Wall** | Newsroom energy, screens | Editorial hair photography | Architectural drawings | Calming nature | Law library leather | Job site aerial |
| **Lighting** | Cool key, monitor glow | Warm key, accent sparkle | Dramatic spotlight | Even soft clinical | Warm desk lamps | Harsh work lights |
| **Ambient audio** | Low newsroom hum | Soft strings | Near-silence gallery | Gentle nature filter | Library quiet | Industrial hum |
| **Glass tint** | Cool blue-gray | Warm rose gold | Clear minimal | Clinical clear | Cool blue-gray | Amber safety |
| **Particles** | Digital motes | Gold dust | None | Minimal dust | None | Dust motes |
| **Furniture scale** | Standard | Generous (1.3×) | Precise (1.0×) | Open (1.2×) | Structured (1.0×) | Compact (0.8×) |
| **Motion pacing** | Brisk (0.8×) | Deliberate (1.2×) | Still (1.3×) | Calm (1.1×) | Measured (1.0×) | Direct (0.9×) |
| **Approval sound** | Digital chime | Crystal bell | Soft tap | Gentle bell | Gavel tap | Impact stamp |
| **Terminology** | "Story Direction" | "Creative Vision" | "Design Direction" | "Care Communication" | "Case Strategy" | "Project Planning" |

**Zero department rebuild. Zero compiler profile change. Only Genome snapshot differs.**

---

## Compile-Time Injection Process

```
Step 1: RESOLVE Genome snapshot from Input System
Step 2: MAP domains to PromptVariable keys per asset category
Step 3: TRANSLATE principles to natural language (never hex codes)
        colorPrinciples: "warm rose-gold accents, muted earth tones, high contrast moments"
        materialLanguage: "polished marble surfaces, brushed brass fixtures, velvet seating"
        lightingStyle: "warm key light from above-front, soft amber fill, accent sparkle on hero"
Step 4: INJECT into PromptStack.genome layer (03)
Step 5: APPLY thingsWeNeverDo to negative prompts
Step 6: SELECT material family hints from materialLanguage
Step 7: SCALE motion parameters from pacing domain
Step 8: SET atmosphere weight from brandEmotions + Experience DNA
Step 9: RECORD genome.profileId in asset metadata (06)
```

---

## Natural Language Translation Rules

Genome domains are **never** converted to hex codes, font names, or specific model numbers in prompts.

| Genome Domain | Prompt Translation |
|---------------|-------------------|
| `colorPrinciples: "warm luxury"` | "warm-toned materials with rose-gold accent potential, muted earth palette" |
| `materialLanguage: "crystal and marble"` | "polished marble floors, crystal display surfaces, brass fixture accents" |
| `lightingStyle: "dramatic editorial"` | "dramatic key lighting with deep shadows, spotlight accents on hero surfaces" |
| `brandEmotions: "calm confidence"` | "atmosphere of calm confidence, generous negative space, restrained particle density" |
| `thingsWeNeverDo: ["neon colors"]` | Added to negative prompt: "no neon colors, no fluorescent tones" |
| `photographyDirection: "editorial beauty"` | "editorial beauty photography style for mood surfaces, soft focus backgrounds" |

---

## Genome Profile Comparison (Marketplace)

Marketplace packages include **Genome Transform Previews** — the same package rendered with 3+ Genome profiles:

```
previews/genome-transforms/
├── luxury-hair.webp          # Frontal Slayer Genome
├── law-firm.webp               # Legal practice Genome
├── medical-practice.webp       # Medical Genome
├── media-command.webp          # NDX Genome
└── construction-co.webp        # Construction Genome
```

Buyers see how the package adapts before installing.

---

## Genome Refresh Compilation

When Company Genome updates significantly:

| Change Scope | Recompile Scope |
|-------------|----------------|
| Color principles | Materials, particles, glass, lighting, previews |
| Material language | Materials, environment, furniture, decor |
| Lighting style | Lighting, previews |
| Music style | Audio |
| Visual references | Mood Wall, decor, previews |
| Voice/personality | — (runtime only) |
| Terminology | — (runtime only) |
| thingsWeNeverDo addition | Negative prompts for all visual assets |
| Full Genome rebuild | Full recompile recommended |

Compiler mode: `genome-refresh` (see 01 Compilation Modes).

---

## Dual Injection: Compile + Runtime

Some Genome effects require **both stages**:

| Effect | Compile-Time | Runtime |
|--------|-------------|---------|
| Marble environment | Prompt: "marble surfaces" | Shader: Genome color principles |
| Warm lighting | Prompt: "warm key light" | Light rig: Genome temperature values |
| Editorial mood wall | Prompt: "editorial photography style" | Mood Wall: Genome visual reference images |
| Luxury spacing | Prompt: "generous spatial proportions" | Layout: Genome spatialDesign multiplier |
| Brand voice | — | AI TTS: Genome voice parameters |
| Terminology | — | Labels: Genome terminology map |

**Rule:** Compile-time sets character. Runtime sets precise values.

---

## Genome Conflict Resolution

| Conflict | Resolution |
|----------|------------|
| Genome vs Founder Note (constraint) | Founder Note wins |
| Genome vs thingsWeNeverDo | thingsWeNeverDo is absolute veto |
| Genome vs Project Intent mood | Project overlays unless Genome constraint |
| Genome vs Industry DNA | Genome wins for visual; Industry for workflow |
| Empty Genome domain | SDK default + gentle enrichment suggestion |

---

## Validation

| Check | Requirement |
|-------|-------------|
| No hex codes in any prompt | Automated scan |
| No font names in any prompt | Automated scan |
| No logo URLs in any prompt | Automated scan |
| Genome profileId in all asset metadata | Schema validation |
| 3+ transform previews in package | Marketplace requirement |
| Generated assets differ across 3+ Genomes | Visual QA review |
| thingsWeNeverDo in all negative prompts | Automated injection check |

---

_Next: [09 — World Assembly](./09_WORLD_ASSEMBLY.md)_
