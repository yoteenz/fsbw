# Creative Direction Studio™

**Studio OS™ — Foundational Creative Operating Layer**

**Type:** Core subsystem (architecture + first functional pilot)

**Status:** Canonical creative intent layer — lives **above** [Studio Production Engine™](./studio-production-engine.md)

**Relationship:** Every project receives a Creative Direction workspace **before** entering Discover Department. Direction persists through the entire [Master Content Pipeline™](./master-content-pipeline.md) lifecycle.

---

## Position in Studio OS

Creative Direction Studio™ is **not** a production department. It is a **foundational subsystem** alongside:

| Subsystem | Role |
|-----------|------|
| **Studio Orb** | Natural-language command + triage |
| **Creative Direction Studio™** | Living creative brain · canonical intent |
| **Studio Production Engine™** | Ten department workspaces · execution |
| **Design Language System** | Visual canon |
| **Component Catalog** | Reusable UI assets |
| **Design Governance** | Compliance + consistency |

```
Creative Direction Studio™  ←  canonical creative intent (continuous)
         ↓ reads / contributes
Studio Production Engine™   ←  Discover → … → Learning
         ↓
Master Content Asset™
```

---

## Core philosophy

Creative direction is **continuous**, not locked at project creation.

- Ideas arrive while scrolling Instagram
- Packaging sparks a better campaign
- A reel changes visual language
- A founder changes their mind

Studio OS **embraces evolution** instead of treating it as disruption.

---

## Workspace contents

Each project workspace includes:

- Creative Brief · Project Vision · North Star
- **Living Mood Board** (auto-updated sections)
- **Inspiration Library** with Studio Intelligence extraction
- Parallel **Creative Timelines** (branches — never overwrite ideas)
- Creative Direction Notes (evolved from Founder Notes)
- Concierge recommendations · AI suggestions
- Direction Timeline · Version History

### Inspiration intelligence (extracted per reference)

Lighting · Composition · Mood · Materials · Typography · Motion · Camera · Pacing · Luxury cues · Color palette · Brand personality · Emotional direction · Visual hierarchy · Design language

---

## Creative commands (Studio Orb)

Founders type naturally at any stage:

- *"Let's change the direction."*
- *"Make it feel like Apple introducing Vision Pro."*
- *"Generate three stronger concepts."*
- *"Use this Instagram Reel as inspiration."*
- *"Start over."* · *"Keep only the typography."*

Studio Orb interprets intent, proposes concepts, and surfaces **downstream impact** with options:

1. Update downstream assets  
2. Rebuild affected stages  
3. Keep existing versions  
4. Create parallel creative branch  

---

## Department behavior

Every production department:

1. **Reads** active Creative Direction before work  
2. **Contributes** notes back to the studio  
3. **Warns** when direction changes affect downstream artifacts  

---

## NDXBook Page 001 pilot

| Route | Purpose |
|-------|---------|
| `/admin/studio/ndxbook/creative-direction` | Full Creative Direction Studio workspace |
| `/admin/studio/ndxbook/newsroom/:departmentId` | Production Engine (reads direction strip) |

**Code:** `src/studio-os-core/creative-direction-studio/` · `src/components/admin/studio-os/creative-direction-studio/`

**Storage:** `studioOsCreativeDirection_v1`

**Seed branches (Page 001):** Luxury Editorial · Apple Launch · Fashion Campaign · Minimal Luxury · High Energy Social · Futuristic

---

## Related docs

- [Studio Production Engine™](./studio-production-engine.md)
- [Master Content Pipeline™](./master-content-pipeline.md)
- [Studio Orb](./studio-orb.md)
- [Design DNA Canon](./design-dna-canon.md)
