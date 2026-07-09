# Studio OS Design DNA™

**Project:** Studio OS  
**System:** Studio OS Design DNA™  
**Status:** Canonical constitutional design language draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Parent:** Genesis™ · Studio Design Constitution™ · Design Language System™  
**Depends on:** Executive Headquarters™, Orb™, Studio World Atlas™, Institute of Knowledge™, Design Token Engine™, Component Registry™, Design Compliance Engine™, Universal Interaction Model™, Universal Decision Architecture™  
**Constitutional posture:** Studio OS is its own visual category. Future work instantiates this Design DNA™; it does not reinterpret it.

---

## 0. Prime directive

```text
Studio OS should never be redesigned.

It may evolve through governed Design DNA™ extensions, but every Headquarters,
department, room, workspace, scene, application, animation, and AI experience
must inherit the same constitutional visual grammar.
```

Studio OS Design DNA™ is not a UI style guide.

It is the permanent visual constitution for a living intelligent operating environment.

### 0.1 Anti-patterns

Studio OS must never imitate:

- traditional SaaS
- dashboards as the primary metaphor
- generic operating systems
- component libraries without place
- dark enterprise control rooms
- gamified novelty
- disconnected brand skins
- per-room redesigns

Studio OS must feel like:

- an executive headquarters
- a luxury architectural environment
- a world-class operating system
- a living intelligent environment
- a museum of knowledge
- a cinematic digital world

### 0.2 Constitutional promise

Thousands of future rooms, departments, professions, companies, Headquarters, AI experiences, and products should feel different in purpose but unmistakably part of the same civilization.

---

## 1. Design philosophy

| Principle | Constitutional rule |
|-----------|---------------------|
| **World before interface** | Every surface is a place with atmosphere, not a page with widgets. |
| **Architecture before decoration** | Framing, depth, hierarchy, light, and material define beauty. Ornament is secondary. |
| **Intelligence as presence** | AI is embodied by Orb, environment, recommendations, and subtle state — not a chatbot skin. |
| **Executive calm** | Power is available without visual anxiety. Nothing screams unless safety requires it. |
| **Progressive complexity** | The center stays clear. Depth emerges through intent, focus, Orb, docks, and room-specific panels. |
| **Institutional memory** | The design should feel like it can preserve decisions, artifacts, and knowledge for decades. |
| **Permanent recognizability** | Users should recognize Studio OS before reading text. |
| **Governed evolution** | Visual change happens by Design DNA revision, not local redesign. |

---

## 2. Universal scene grammar

Every Studio OS environment inherits the same spatial grammar:

```text
Atmosphere Layer
  -> Hero Environment
    -> Architectural Frame
      -> Primary Focal Object
        -> Executive Summary Area
          -> Feature Panels
            -> Capability Cards
              -> Navigation Layer
                -> Orb Integration
                  -> Ephemeral Docks / Overlays
```

### 2.1 Required scene elements

| Element | Purpose | Rule |
|---------|---------|------|
| **Hero Environment** | Establish place, department, and emotional tone before content. | Must use department color, lighting, material, and spatial depth. |
| **Primary Focal Object** | The room's object of attention. | One dominant object per room: table, atlas, archive wall, model desk, timeline, command map, theater, lab bench. |
| **Architectural Framing** | Gives the surface permanence. | Use glass, marble, chrome, light rails, columns, shelves, portals, or horizon lines. |
| **Department Identity** | Cognitive location. | Department primary color must be visible in ambient light, active navigation, and key affordances. |
| **Executive Summary Area** | 3-second comprehension. | Always present for executive and knowledge rooms; never buried below fold. |
| **Feature Panels** | Structured capability access. | Panels float as glass surfaces; no flat SaaS cards without environmental role. |
| **Capability Cards** | Actionable units. | Cards represent capability, artifact, mission, system, or object — not arbitrary stats. |
| **Navigation Layer** | Spatial movement. | Users should know where they are by color, room frame, and focal object before labels. |
| **Orb Integration** | Intelligence presence. | Orb remains bottom-weighted and persistent unless a cinematic sequence temporarily relocates it. |
| **Scene Transition Rules** | Continuity across rooms. | Transitions carry department color and object lineage; no hard cuts between unrelated visual languages. |

---

## 3. Layout constitution

### 3.1 Master room template

Every Headquarters room must derive from one reusable template:

```text
┌────────────────────────────────────────────────────────────┐
│ Arrival / Room Header                                      │
│ department mark · room title · breadcrumb · primary action │
├───────────────┬────────────────────────────────────────────┤
│ Spatial Nav   │ Hero Environment                           │
│ or Rail       │   Primary Focal Object                      │
│               │   Executive Summary / Room Brief           │
│               │   Primary Work Surface                     │
├───────────────┴────────────────────────────────────────────┤
│ Capability Layer: feature panels · cards · timelines       │
├────────────────────────────────────────────────────────────┤
│ Context Ribbon: metrics · state · provenance · validation  │
└────────────────────────────────────────────────────────────┘

Studio Orb™ persists outside the room frame at bottom-right.
Ephemeral docks float over the room only when summoned.
```

### 3.2 Grid

| Layer | Grid rule |
|-------|-----------|
| **Viewport** | 12-column desktop grid with breathable margins; 6-column tablet; 1-column mobile. |
| **Room shell** | Max content width: 1440px unless cinematic room intentionally spans full viewport. |
| **Hero zone** | 60-75% of first viewport height on desktop; 45-60% on utility rooms. |
| **Primary work surface** | 7-9 columns desktop; cannot be squeezed below readable width. |
| **Navigation rail** | 2-3 columns or 220-280px; collapses to scene tray on mobile. |
| **Inspector / dock** | Floating overlay; never permanent if it competes with the focal object. |

### 3.3 Spacing rhythm

Studio OS uses **breath-first spacing**.

| Token | Value | Use |
|-------|-------|-----|
| `space-3xs` | 4px | micro gaps, icon-label |
| `space-2xs` | 6px | dense metadata |
| `space-xs` | 8px | compact controls |
| `space-sm` | 12px | card inner rhythm |
| `space-md` | 16px | panel inner rhythm |
| `space-lg` | 24px | section separation |
| `space-xl` | 32px | hero card separation |
| `space-2xl` | 48px | room section breaks |
| `space-3xl` | 72px | arrival / ceremony breaks |
| `space-4xl` | 96px | cinematic whitespace |

Rule: More important content receives more surrounding silence.

### 3.4 Visual rhythm

- Headers breathe: top margin > bottom margin.
- Metadata stays thin, uppercase, and peripheral.
- Primary action appears once per viewport moment.
- Groups form in 3, 4, 5, or 7; avoid unstructured grids.
- Room rhythm alternates: atmosphere → focus → capability → evidence → action.

---

## 4. Information hierarchy

Every room must answer in order:

1. Where am I?
2. What kind of place is this?
3. What should I pay attention to?
4. What has changed?
5. What can I do?
6. What evidence supports this?
7. What does Orb recommend?
8. What happens next?

### 4.1 Executive hierarchy

| Priority | Visual treatment |
|----------|------------------|
| **Room identity** | Department color + title + focal object + ambient light. |
| **Executive summary** | Large calm body; max 3 sentences; near focal object. |
| **Primary action** | One high-confidence action; not a button farm. |
| **Evidence** | Provenance chips, validation rows, links to Genesis/Registry/History. |
| **Secondary actions** | Lower contrast, grouped in rails or docks. |
| **Diagnostics** | Progressive reveal; never default unless room is explicitly operational. |

---

## 5. Camera system

Studio OS uses camera logic, not page logic.

| Camera mode | Use | Motion |
|-------------|-----|--------|
| **Arrival wide** | Entering Headquarters, department, major room. | Slow fade + slight scale-in; reveals environment first. |
| **Executive medium** | Default room operating state. | Stable; minimal parallax; content clarity. |
| **Object close-up** | Editing artifact, prompt, mission, model, asset. | Focal object expands; background dims. |
| **Council / meeting frame** | Boardroom, reflection, strategy. | Center table / circular arrangement; Orb presenter. |
| **Archive pan** | History, library, museum, lineage. | Horizontal or vertical timeline movement. |
| **Simulation orbit** | Scenarios, digital twins, profession sims. | Controlled orbit around model; reduced motion alternative required. |
| **Command focus** | Command Center, Mission Control. | Zoom to action map; no unnecessary cinematic drift. |

Rules:

- Camera motion must explain spatial relationship.
- Never use motion to hide slow loading or weak hierarchy.
- Every camera transition must have a reduced-motion equivalent.

---

## 6. Environmental storytelling

Each room must communicate its purpose visually before copy:

| Room purpose | Environmental cue |
|--------------|-------------------|
| Executive leadership | Marble table, light crown, command horizon, quiet authority. |
| Knowledge | Shelves, archive drawers, manuscripts, constellations, library light. |
| AI | Crystal, spectral light, model lattice, soft intelligence pulse. |
| Creative | Studio floor, mood walls, material trays, preview stages. |
| Engineering | Blueprint glass, systems map, diagnostic rails, precise grid. |
| Finance | Ledger table, gold lines, portfolio horizon, restrained density. |
| Research | Observatory, lab glass, source evidence fields, inquiry lamps. |
| Simulation | Theater, model chamber, scenario horizon, time controls. |
| Archive | Vault, timeline, museum cases, subdued warm light. |
| Academy | Lecture hall, learning path, progress constellations, mentor presence. |

Environmental storytelling is not decorative background art. It is cognitive navigation.

---

## 7. Material language

### 7.1 Core materials

| Material | Purpose | Token family |
|----------|---------|--------------|
| **Marble** | Permanence, calm, institution. | `material-marble-*` |
| **Architectural glass** | Layering, focus, intelligence without walls. | `material-glass-*` |
| **Crystal / acrylic** | Orb, AI presence, intelligence objects. | `material-crystal-*` |
| **Chrome / fine metal** | Precision edges, executive restraint. | `material-metal-*` |
| **Paper / manuscript** | Knowledge, prompt, archive, education. | `material-paper-*` |
| **Light rails** | Navigation, state, directionality. | `material-light-*` |
| **Holographic field** | AI projection, simulation, model comparison. | `material-hologram-*` |

### 7.2 Glass architecture rules

- Glass is architecture, not a trend.
- Max three glass layers visible at once.
- Glass must preserve text contrast.
- Glass panels need edge definition: border, inner glow, or shadow.
- Dark glass is cinematic, not default.
- Department tint may influence glass, but cannot reduce legibility.

### 7.3 Elevation

Elevation means spatial importance, not card decoration.

| Elevation | Value | Use |
|-----------|-------|-----|
| `elevation-0` | none | environment base |
| `elevation-1` | soft ambient shadow | standard panel |
| `elevation-2` | stronger float | active panel / dock |
| `elevation-3` | cinematic projection | Orb surfaces, modal focus |
| `elevation-4` | command overlay | Atlas, Command Dock, major presentation |

---

## 8. Lighting system

Lighting is the emotional OS.

| Light type | Purpose |
|------------|---------|
| **Ambient light** | Department identity and room mood. |
| **Key light** | Primary focal object. |
| **Edge light** | Glass/material readability. |
| **State glow** | Active/notification/mission/learning state. |
| **Orb light** | Intelligence presence and attention. |
| **Ceremony light** | Arrival, canonization, launch, summit. |
| **Safety light** | Errors, risks, blocked states — sparse and precise. |

Rules:

- Default Studio OS is luminous, not dark.
- Red is decisive and should not become visual noise.
- Alerts use stillness plus copy; not flashing.
- Learning uses warm guided light.
- Executive state uses calm authority light.

---

## 9. Typography constitution

Typography roles survive font changes.

| Role | Purpose | Rule |
|------|---------|------|
| **Display** | Room titles, ceremonies, editorial statements. | Large, calm, rare. |
| **UI label** | Navigation, metadata, buttons, chips. | Uppercase, letter-spaced, disciplined. |
| **Body** | Reading, explanation, summaries. | 1.45-1.65 line-height, 45-75 character line length. |
| **Accent human** | Founder warmth, Orb grace, quotes. | Sparse; never replaces UI structure. |
| **Monospace** | IDs, code, registry, technical provenance. | Functional, never decorative. |

### 9.1 Scale

| Token | Desktop | Use |
|-------|---------|-----|
| `type-micro` | 7-9px | metadata, rail labels |
| `type-caption` | 10-11px | chips, state labels |
| `type-body-sm` | 12px | dense panels |
| `type-body` | 14px | standard reading |
| `type-body-lg` | 16px | executive summaries |
| `type-title` | 20-24px | room section titles |
| `type-display` | 32-48px | arrival / hero |
| `type-ceremony` | 56-96px | rare cinematic moments |

Rules:

- Max two active families per surface.
- UI labels must remain legible at small sizes.
- Headline drama cannot compensate for weak hierarchy.

---

## 10. Iconography and illustration

### 10.1 Iconography

Studio OS icons are **architectural symbols**, not generic app icons.

| Icon type | Rule |
|-----------|------|
| Department icons | Permanent, color-bound, simple silhouette or line-symbol. |
| Room icons | Derived from primary focal object. |
| Capability icons | Functional, secondary to text. |
| State icons | Minimal; color + motion may carry state. |
| Orb icons | Crystal/object-based; never mascot. |

### 10.2 Illustration

Illustration should be:

- architectural
- schematic
- museum-quality
- cinematic when used
- sparse
- subordinate to real product structure

Avoid cartoon illustration, stock SaaS people, generic gradients, and disconnected decorative mascots.

---

## 11. Orb constitution

Orb is the most recognizable intelligence artifact in Studio OS.

### 11.1 Placement

| Context | Placement |
|---------|-----------|
| Default desktop | Bottom-right, fixed, above room surfaces. |
| Mobile | Bottom-right safe area or bottom-center if thumb ergonomics require it. |
| Executive presentation | Center-stage only during Orb Presentation Mode™, then returns to anchor. |
| Cinematic awakening | Full-screen temporary relocation. |
| Meeting room | May appear as presenter light/object near table, while persistent control remains available. |

### 11.2 Behavior

- Orb opens radial tools, Command Dock, Atlas, guide, recommendations, voice, and executive workspace.
- Orb never blocks primary work by default.
- Orb can pulse, breathe, glow, or dim to communicate state.
- Orb must never become a generic chatbot button.
- Orb recommendations must show evidence, confidence, alternatives, and source systems.

### 11.3 Orb states

| State | Visual language |
|-------|-----------------|
| Idle | Calm crystal, low glow. |
| Listening | Gentle pulse, no aggressive animation. |
| Thinking | Breathe + subtle caustic movement. |
| Recommending | Opportunity glow, warm edge. |
| Warning | Stillness + precise red/gold signal. |
| Presentation | Larger, center-weighted, ceremonial. |
| Librarian | Soft blue/violet knowledge tint. |
| Executive | Gold/red authority light. |

---

## 12. Panel, card, button, and navigation design

### 12.1 Panels

Panels are architectural glass surfaces.

| Panel type | Rule |
|------------|------|
| **Hero panel** | Large, quiet, contains summary and focal object. |
| **Feature panel** | Medium glass surface, one capability. |
| **Inspector panel** | Dense but narrow; opened on demand. |
| **Dock panel** | Ephemeral, elevated, command/AI/tooling. |
| **Archive panel** | Warmer, paper/manuscript texture allowed. |
| **Simulation panel** | Holographic field with controls. |

### 12.2 Cards

Cards represent objects:

- mission
- prompt
- system
- company
- person
- artifact
- recommendation
- execution
- model
- validation result

Cards should not be generic statistic boxes unless the room is explicitly analytical.

### 12.3 Buttons

| Button type | Use |
|-------------|-----|
| Primary | One primary action per viewport moment. |
| Secondary | Supporting action, lower contrast. |
| Ghost | Navigation or low-risk utility. |
| Danger | Rare, still, copy-led. |
| Ceremony | Launch, canonize, publish, approve — high meaning. |

Button language:

- uppercase labels
- precise verbs
- no playful microcopy in serious contexts
- accessible hit areas
- motion on hover must be subtle

### 12.4 Navigation

Studio OS navigation is cognitive and spatial:

- department color
- room focal object
- material cue
- persistent rail/atlas
- breadcrumb only as confirmation

Navigation layers:

1. **Atlas** — world-scale movement.
2. **Headquarters / department rail** — local movement.
3. **Room tray** — in-room sections.
4. **Orb radial** — intelligence/tool movement.
5. **Command Dock** — intent movement.

---

## 13. Cognitive Navigation System™

Users should know where they are before reading text.

### 13.1 Color hierarchy

```text
Department Color™
  -> Division Shade™
    -> Room Accent™
      -> Interactive State™
        -> Notification State™
          -> Mission State™
            -> Learning State™
              -> Executive State™
```

### 13.2 Definitions

| Layer | Definition | Use |
|-------|------------|-----|
| **Department Color™** | Permanent primary color for major operating domain. | Ambient light, active nav, hero accents, key actions. |
| **Division Shade™** | Derived tone for sub-domain/wing. | Secondary panels, rail group, map region. |
| **Room Accent™** | Specific room/focal object accent. | Object glow, selected card, scene detail. |
| **Interactive State™** | Hover/active/focus/pressed. | Must derive from department color. |
| **Notification State™** | Info/success/warning/risk. | Semantic overlay; never replaces department identity. |
| **Mission State™** | queued/active/blocked/complete. | Mission Engine and Command Center surfaces. |
| **Learning State™** | new/learning/mastered/review. | Academy and guidance surfaces. |
| **Executive State™** | review/decision/approval/canonize. | Founder judgment moments. |

### 13.3 Department color framework

Each department receives:

- Primary Color™
- Secondary Color™
- Accent Color™
- Ambient Lighting™
- Glass Tint™
- Interaction Effects™
- Animation Personality™

| Department | Primary | Secondary | Accent | Ambient Lighting | Glass Tint | Interaction Effects | Animation Personality |
|------------|---------|-----------|--------|------------------|------------|---------------------|-----------------------|
| **Headquarters** | `#EB1C24` Studio Red | `#1A1A1A` Executive Black | `#C9A962` Gold | warm marble + red horizon | clear white + red edge | decisive red underline, gold approval | calm executive reveal |
| **Executive Leadership** | `#8B1E2D` Cabernet | `#2B1A1E` Deep burgundy | `#D6B36A` Brass | boardroom warmth | ivory/cabernet | seal, approval, council focus | measured, ceremonial |
| **Mission Control** | `#F97316` Signal Orange | `#7C2D12` Burnt command | `#FACC15` Mission amber | command horizon | amber glass | active queue glow | purposeful, directional |
| **Command Center** | `#EF4444` Command Red | `#111827` Slate black | `#F59E0B` Action amber | alert-ready but calm | clear/red edge | action lock, confirmation pulse | precise, quick |
| **Artificial Intelligence** | `#6366F1` Intelligence Indigo | `#312E81` Deep indigo | `#A5B4FC` Spectral blue | crystal violet | violet glass | model lattice pulse | thinking, breathing |
| **Orb** | `#C9A962` Champagne Gold | `#FFF8F0` Warm crystal | `#88C8FF` Refraction blue | living crystal glow | acrylic clear | radial projection shimmer | alive, restrained |
| **Creative** | `#EC4899` Creative Magenta | `#831843` Deep studio rose | `#F9A8D4` Soft neon | studio stage wash | rose glass | material hover glow | expressive, fluid |
| **Knowledge** | `#2563EB` Knowledge Blue | `#1E3A8A` Archive navy | `#93C5FD` Library light | library skylight | blue-white glass | source highlight | quiet, archival |
| **Institute of Knowledge** | `#4F46E5` Institute Violet | `#312E81` Ink violet | `#C4B5FD` Manuscript glow | museum/library light | violet-blue glass | canon glow, shelf reveal | reverent, scholarly |
| **Operations** | `#0D9488` Operations Teal | `#134E4A` Deep teal | `#5EEAD4` Flow mint | workflow stream light | teal glass | status flow | efficient, steady |
| **Engineering** | `#0284C7` Engineering Cyan | `#0C4A6E` Blueprint blue | `#67E8F9` Circuit light | blueprint glow | cyan glass | diagnostic edge | exact, mechanical |
| **Infrastructure** | `#475569` Infrastructure Slate | `#0F172A` Deep slate | `#CBD5E1` Steel light | foundation light | smoke-clear glass | grid snap | stable, minimal |
| **Platform** | `#9333EA` Platform Purple | `#581C87` Deep platform | `#D8B4FE` System glow | platform aura | purple glass | module reveal | composed, expandable |
| **Finance** | `#A16207` Finance Gold | `#3F2D0B` Ledger brown | `#FDE68A` Ledger light | ledger table light | gold ivory | value tick | deliberate, conservative |
| **Research** | `#0891B2` Research Cyan | `#164E63` Observatory teal | `#A5F3FC` Evidence light | lab/observatory | cyan glass | evidence focus | investigative, smooth |
| **Marketing** | `#F43F5E` Marketing Rose | `#881337` Campaign wine | `#FDA4AF` Campaign light | campaign glow | rose clear | launch sparkle restrained | energetic, polished |
| **Customer Experience** | `#14B8A6` CX Aqua | `#115E59` Deep aqua | `#99F6E4` Care light | concierge warmth | aqua glass | response ripple | empathetic, soft |
| **Academy** | `#7C3AED` Academy Violet | `#4C1D95` Mentor violet | `#DDD6FE` Learning light | study hall glow | violet ivory | progress constellation | guided, uplifting |
| **Simulation** | `#06B6D4` Simulation Cyan | `#155E75` Deep scenario | `#67E8F9` Hologram light | theater horizon | holographic cyan | scenario orbit | cinematic, controlled |
| **Automation** | `#22C55E` Automation Green | `#14532D` Deep automation | `#86EFAC` Signal green | process glow | green clear | completion pulse | rhythmic, reliable |
| **Security** | `#DC2626` Security Red | `#450A0A` Deep risk | `#FCA5A5` Safety light | restrained warning | red clear | still warning edge | still, serious |
| **Support** | `#0EA5E9` Support Sky | `#075985` Deep sky | `#BAE6FD` Help light | service glow | sky glass | reply ripple | helpful, light |
| **Expansion** | `#10B981` Expansion Emerald | `#064E3B` Deep emerald | `#A7F3D0` Growth light | horizon growth | emerald glass | map expansion | optimistic, spacious |
| **Studio Exchange** | `#D97706` Exchange Amber | `#78350F` Marketplace brown | `#FCD34D` Trade light | marketplace warmth | amber glass | listing glow | active, transactional |
| **Company Management** | `#64748B` Company Slate | `#1E293B` Governance slate | `#E2E8F0` Registry light | structured office | slate clear | record focus | stable, administrative |
| **Profession Brains** | `#8B5CF6` Profession Violet | `#5B21B6` Deep brain | `#C4B5FD` Intelligence light | role constellation | violet glass | skill graph glow | mentoring, intelligent |

### 13.4 Semantic states

| State | Color | Motion | Rule |
|-------|-------|--------|------|
| Info | `#2563EB` | soft reveal | Secondary to department color. |
| Success | `#16A34A` | brief glow | Never confetti by default. |
| Warning | `#D97706` | still + edge | Requires copy and evidence. |
| Risk / error | `#DC2626` | no loop | Use sparingly; do not animate panic. |
| Active mission | department primary | directional glow | Shows momentum. |
| Blocked mission | warning amber | still | Show blocker reason. |
| Complete mission | success green + department tint | one pulse | Preserve audit trail. |
| Learning | academy violet | guided pulse | Encouraging, not gamified. |
| Executive decision | gold/red | ceremonial reveal | Requires human judgment. |

---

## 14. Room architecture

### 14.1 Hero Rooms™

Purpose: flagship arrival, identity, major operating environments.

Rules:

- full scene atmosphere
- large primary focal object
- low information density on first view
- Orb greeting or executive brief
- cinematic entrance allowed
- no dense tables above the fold

Examples: Executive Atrium™, Founder Office™, Institute of Knowledge™, Command Center™.

### 14.2 Support Rooms™

Purpose: specialized capabilities under a larger department.

Rules:

- inherit department color
- smaller focal object
- medium information density
- clear back-path to parent room
- capability cards and evidence panels allowed

### 14.3 Utility Rooms™

Purpose: configuration, registries, settings, operational tasks.

Rules:

- may be denser but still glass/architectural
- no generic admin table without framing
- default to clarity over ceremony
- keep Orb and navigation present

### 14.4 Executive Rooms™

Purpose: decisions, review, strategy, approval, reflection.

Rules:

- calm, spacious, high trust
- decision packets show evidence/tradeoffs/confidence
- approval/canonization actions are ceremonial
- Orb must separate evidence, interpretation, uncertainty, and recommendation

### 14.5 Learning Rooms™

Purpose: education, onboarding, Academy, guidance.

Rules:

- progressive path visualization
- mentor tone
- learning state color
- feedback without shame
- mastery shown as competence, not points clutter

### 14.6 Simulation Rooms™

Purpose: scenarios, digital twins, forecasting, practice.

Rules:

- holographic model or theater focal object
- time controls visible
- assumptions and confidence always present
- reduced motion alternative required

### 14.7 Creative Rooms™

Purpose: content, assets, creative direction, production.

Rules:

- canvas or stage dominates
- mood/material panels are environmental
- preview before settings
- AI critique appears as director, not sidebar spam

### 14.8 Research Rooms™

Purpose: inquiry, evidence, discovery, validation.

Rules:

- source provenance prominent
- lab/observatory cues
- confidence and unknowns visible
- no unsupported claims without evidence state

### 14.9 Meeting Rooms™

Purpose: multi-participant decision/reflection/council moments.

Rules:

- table/circle/council focal geometry
- speaker/agenda state visible
- Orb presenter mode allowed
- meeting outputs are artifacts, not transcripts only

### 14.10 Archive Rooms™

Purpose: history, memory, lineage, artifacts, legacy.

Rules:

- museum/library/vault material
- timeline or shelf hierarchy
- read-only state visually distinct
- provenance and version visible

### 14.11 Future Rooms™

Purpose: unbuilt or speculative spaces.

Rules:

- visibly locked/previewed without feeling dead
- future silhouette or light outline
- requirements for unlock shown
- no fake interaction

---

## 15. Motion and animation language

Motion must communicate:

- arrival
- continuity
- hierarchy
- state change
- intelligence presence
- completion
- risk

Motion must not:

- distract
- compensate for weak design
- gamify serious work
- obscure slow systems
- run endlessly except ambient presence

### 15.1 Timing tokens

| Token | Duration | Use |
|-------|----------|-----|
| `motion-instant` | 80ms | pressed, focus |
| `motion-fast` | 120ms | hover, small state |
| `motion-standard` | 220ms | panel reveal |
| `motion-room` | 420ms | room section transition |
| `motion-cinematic` | 600ms | arrival, ceremony |
| `motion-ceremony` | 900-1200ms | canonization, launch, awakening |

### 15.2 Easing

| Token | Curve | Use |
|-------|-------|-----|
| `ease-executive` | cubic-bezier(0.22, 1, 0.36, 1) | default entrance |
| `ease-quiet-exit` | cubic-bezier(0.4, 0, 1, 1) | exits |
| `ease-orb` | cubic-bezier(0.16, 1, 0.3, 1) | Orb/radial projection |
| `ease-simulation` | cubic-bezier(0.33, 1, 0.68, 1) | model movement |

### 15.3 Reduced motion

Reduced motion must:

- remove parallax/orbit
- preserve state clarity
- use opacity/instant transitions
- never hide functionality

---

## 16. Interaction patterns

### 16.1 Core interaction doctrine

| Pattern | Rule |
|---------|------|
| **Ask Orb** | Use when intent is fuzzy, strategic, or cross-system. |
| **Direct manipulate** | Use when object is visual, spatial, or creative. |
| **Command Dock** | Use for power actions and cross-system intent. |
| **Inspector** | Use for precise fields and metadata after selection. |
| **Approval ceremony** | Use for irreversible, canonical, public, or founder-level changes. |
| **Inline edit** | Use for low-risk object text and metadata. |
| **Timeline scrub** | Use for history, lineage, simulation, execution history. |
| **Atlas travel** | Use for world/location movement. |

### 16.2 Micro-interactions

Micro-interactions should be subtle and meaningful:

- hover: light edge, slight lift, not bounce
- focus: clear accessibility ring using department tint
- active: short compression or glow
- success: one restrained pulse
- error: stillness + explicit message
- loading: skeleton glass, Orb thinking, or staged reveal
- recommendation: opportunity glow, not pop-up spam

---

## 17. Loading and arrival experiences

### 17.1 Loading

| Loading type | Use |
|--------------|-----|
| **Room skeleton** | Standard page load; glass shells appear before data. |
| **Orb thinking** | AI/computation; show source systems when available. |
| **Archive retrieval** | Knowledge/history loading; drawer/shelf metaphor. |
| **Simulation warm-up** | Scenario/model initialization. |
| **Command processing** | Command Center action; progress with audit trail. |

Loading cannot feel broken or empty. The place should arrive before data finishes.

### 17.2 Arrival

Every major room arrival includes:

1. department color / light
2. focal object reveal
3. room title
4. executive summary or Orb greeting
5. one suggested next action
6. navigation continuity

---

## 18. Visual density

| Room class | Density |
|------------|---------|
| Hero | low |
| Executive | low-medium |
| Creative | content-rich, chrome-light |
| Research | medium, evidence-first |
| Engineering | medium-high but structured |
| Utility | high allowed if framed |
| Archive | medium, browsable |
| Simulation | low controls, high model presence |
| Mobile | low, one primary stack |

Rule: Density is earned by purpose, never by available space.

---

## 19. Accessibility constitution

Accessibility is dignity.

Minimum rules:

- keyboard access for all controls
- visible focus states
- semantic roles and labels
- color never sole carrier of meaning
- reduced motion support
- contrast preserved through glass
- safe-area support for Orb and docks
- touch targets: 44px preferred, 32px minimum for dense desktop-only controls
- no flashing or frantic error motion
- loading states announced where appropriate
- AI recommendations explain uncertainty

Accessibility failures are Design DNA failures.

---

## 20. Design token system

### 20.1 Token families

```text
studio.color.*
studio.department.*
studio.space.*
studio.radius.*
studio.elevation.*
studio.glass.*
studio.light.*
studio.shadow.*
studio.blur.*
studio.type.*
studio.icon.*
studio.motion.*
studio.scene.*
studio.panel.*
studio.orb.*
studio.state.*
```

### 20.2 Core tokens

#### Radius

| Token | Value | Use |
|-------|-------|-----|
| `radius-none` | 0 | tables, hard architecture |
| `radius-xs` | 4px | small controls |
| `radius-sm` | 6px | buttons |
| `radius-md` | 10px | cards |
| `radius-lg` | 14px | panels |
| `radius-xl` | 20px | hero glass |
| `radius-orb` | 999px | Orb, pills |

#### Glass

| Token | Value |
|-------|-------|
| `glass-clear` | rgba(255,255,255,0.78) + blur(18px) |
| `glass-soft` | rgba(255,255,255,0.58) + blur(24px) |
| `glass-deep` | rgba(255,255,255,0.42) + blur(32px) |
| `glass-cinematic` | rgba(12,11,10,0.62) + blur(28px) |
| `glass-edge` | 1px solid rgba(255,255,255,0.72) |
| `glass-inner-glow` | inset 0 1px 0 rgba(255,255,255,0.95) |

#### Scene widths

| Token | Value |
|-------|-------|
| `scene-readable` | 720px |
| `scene-panel` | 960px |
| `scene-room` | 1200px |
| `scene-wide` | 1440px |
| `scene-cinematic` | 100vw |

#### Panel heights

| Token | Value |
|-------|-------|
| `panel-compact` | 120-180px |
| `panel-standard` | 220-320px |
| `panel-focus` | 420-560px |
| `panel-hero` | 55-75vh |
| `panel-cinematic` | 100dvh |

#### Icon sizes

| Token | Value |
|-------|-------|
| `icon-xs` | 12px |
| `icon-sm` | 16px |
| `icon-md` | 24px |
| `icon-lg` | 32px |
| `icon-hero` | 56px |
| `icon-orb-projection` | 64px |

### 20.3 Token governance

- Tokens live in Design Token Engine™.
- New tokens require registry entry.
- Hardcoded room styling is allowed only as a prototype before tokenization.
- Department colors are constitutional; local overrides require Design DNA revision.
- Tokens may adapt by organization genome only within contrast and hierarchy constraints.

---

## 21. Future extensibility

Studio OS Design DNA™ must support:

- mobile
- tablet
- desktop
- large screens
- spatial computing
- multi-window
- voice-first
- AI-generated rooms
- company-specific atmospheres
- profession-specific workspaces
- marketplace templates
- embedded products
- white-labeled Headquarters

Extensibility rules:

1. New environments inherit the master scene template.
2. New departments receive a permanent department color record.
3. New components register in Component Registry™.
4. New tokens register in Design Token Engine™.
5. New visual patterns pass Design Compliance Checklist™.
6. Organization customizations alter atmosphere, not anatomy.
7. AI-generated UI must use the same tokens, components, and room archetypes.

---

## 22. Design governance

### 22.1 Design DNA compliance

Every new room must pass:

| Gate | Requirement |
|------|-------------|
| **Location recognition** | User can identify department/room category before reading body text. |
| **Template inheritance** | Room derives from master scene template. |
| **Department identity** | Uses department color/shade/accent correctly. |
| **Focal object** | Has one clear primary focal object. |
| **Hierarchy** | Answers the 8 information questions in order. |
| **Material compliance** | Uses approved material/glass/elevation rules. |
| **Orb integration** | Orb is present, accessible, and contextually useful. |
| **Navigation continuity** | Atlas/rail/tray/breadcrumb path is clear. |
| **Token compliance** | Uses Design Token Engine™ tokens or documented proposed tokens. |
| **Component compliance** | Uses registered components or proposed experimental components. |
| **Motion compliance** | Meaningful motion + reduced motion path. |
| **Accessibility** | Contrast, keyboard, labels, focus, safe area, reduced motion. |
| **Density fit** | Density matches room archetype. |
| **No SaaS regression** | Does not default to dashboard/table/card wall unless utility room requires it. |
| **Founder acceptance** | Founder can understand where they are and what to do in under 3 seconds. |

### 22.2 Scoring

| Score | Status | Meaning |
|-------|--------|---------|
| 90-100 | PASS · Canonical | Room may become canonical. |
| 80-89 | PASS · Improve | Room can ship preview; improvements required before canon. |
| 70-79 | WARNING | Preview only. |
| <70 | FAIL | Cannot become canonical. |

Critical failures:

- no department identity
- no focal object
- illegible glass
- inaccessible controls
- generic SaaS dashboard layout
- unregistered visual system
- Orb inaccessible where required
- major color conflict with department framework

### 22.3 Design Compliance Checklist™

```markdown
## Design DNA Compliance Checklist™

- [ ] Room derives from Studio OS master scene template.
- [ ] Department Color™, Division Shade™, and Room Accent™ are declared.
- [ ] Primary focal object is visible before secondary panels.
- [ ] Executive summary or room brief appears near the focal object.
- [ ] Navigation layer communicates location before text.
- [ ] Orb placement is persistent and clickable.
- [ ] Feature panels use approved glass/material/elevation tokens.
- [ ] Capability cards represent real objects/capabilities/artifacts.
- [ ] Primary action is singular and clear.
- [ ] Motion communicates state and has reduced-motion equivalent.
- [ ] Loading state preserves place and explains progress.
- [ ] Accessibility floor is met.
- [ ] Visual density matches room archetype.
- [ ] No local style guide or ungoverned redesign introduced.
- [ ] New tokens/components/patterns are registered or proposed.
- [ ] Design Health™ score is recorded.
- [ ] Founder 3-second location test passes.
```

---

## 23. Relationship to existing design governance

| Artifact | Relationship |
|----------|--------------|
| **Genesis.md** | Highest source of truth; Design DNA™ is constitutional article under World Experience. |
| **Studio Design Constitution™** | Governs design inheritance and VDR process. |
| **Design Language System™** | Describes emotional feel; Design DNA™ operationalizes visual grammar. |
| **Design Registry™** | Tracks approved versions of Design DNA™, tokens, and components. |
| **Design Token Engine™** | Runtime token implementation for the DNA. |
| **Component Registry™** | Canonical components that instantiate the DNA. |
| **Design Compliance Engine™** | Future automated compliance validator. |
| **Design DNA Canon™** | Existing customer-facing canon; distinct from Studio OS platform-level DNA. |

---

## 24. Canon rule

```text
Future Studio OS work must instantiate the Design DNA™.

It may create new rooms, departments, objects, motions, and atmospheres,
but it must not reinterpret the visual constitution without a governed
Design DNA revision.
```

Studio OS does not need a redesign after Design DNA™ approval.

It needs faithful instantiation.
