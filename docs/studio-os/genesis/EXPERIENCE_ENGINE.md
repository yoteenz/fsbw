# Experience Engine™ — Canonical Architecture

**Genesis article:** [`../../../genesis/articles/EXPERIENCE_ENGINE.md`](../../../genesis/articles/EXPERIENCE_ENGINE.md)  
**Content home:** [`../../../genesis/experience-engine/`](../../../genesis/experience-engine/)  
**Status:** canonical architecture draft  
**Relationship:** Parent generator above Studio OS Design DNA™

---

## Prime rule

Studio OS should not own a single visual identity.

Studio OS should own an **Experience Engine™** that consumes layered
**Experience DNA™** files.

Studio OS Design DNA™ remains the first official DNA profile. It is not
redesigned; it becomes one generated expression inside the broader engine.

---

## Permanent hierarchy

```text
Studio OS Experience Engine™
  -> Brand DNA™
    -> Department DNA™
      -> Division DNA™
        -> Scene DNA™
          -> Component DNA™
            -> Motion DNA™
              -> Interaction DNA™
                -> Experience™
```

## Brand DNA™ fields

Every Brand DNA™ file defines:

- Brand Philosophy
- Visual Personality
- Emotional Personality
- Executive Personality
- Writing Voice
- Interaction Style
- Lighting
- Materials
- Architectural Style
- Typography
- Color System
- Glass Treatment
- Animation Style
- Sound Direction
- Motion Philosophy
- Icon Language
- Illustration Style
- Orb Personality Overrides
- Navigation Tone
- Environmental Storytelling
- Design Constraints

## Department DNA™ fields

Every Department DNA™ inherits Brand DNA™ while defining:

- Department Color™
- Department Lighting™
- Ambient Mood™
- Scene Identity™
- Particle System™
- Notification Style™
- Executive Mood™
- Knowledge Mood™
- Creative Mood™
- Animation Personality™

## Scene DNA™ inheritance

Every scene inherits:

- Brand DNA
- Department DNA
- Component Library
- Layout Template
- Hero Object
- Capability Panels
- Interaction Model
- Orb Placement
- Environmental Rules

---

## Generation model

```text
Company route opens
  -> Organization Context resolves company
  -> Experience Engine loads company Experience DNA
  -> Brand DNA resolves
  -> Department/Scene DNA resolves for route
  -> Component + token + motion bindings compile
  -> Experience Profile applies to scene root
  -> Orb receives brand + scene personality context
  -> Generated Experience™ renders
```

## Multi-tenant rule

One engine supports many companies because the platform owns the generator while
each company owns versioned Experience DNA™:

| Layer | Owner |
|-------|-------|
| Experience Engine™ | Studio OS |
| Schemas / validators | Studio OS |
| Component anatomy | Studio OS |
| Token families | Studio OS |
| Brand DNA™ | Company |
| Department / Scene DNA™ | Company |
| Experience Profile™ | Generated per tenant |

## Case-study identities

| System | Studio OS™ | Frontal Slayer™ | NDX™ |
|--------|------------|-----------------|------|
| Executive Headquarters™ | marble institution | luxury beauty mansion | media command floor |
| Orb™ | crystal Chief of Staff | stylish hair-bestie concierge | producer / signal analyst |
| Institute of Knowledge™ | museum-library | salon education atelier | editorial research vault |
| Command Center™ | executive operations room | concierge operations salon | newsroom assignment desk |
| Content Engine™ | strategic production system | beauty editorial studio | media publishing command |

The architecture stays identical. The Experience DNA™ changes the identity.

## Canon rule

```text
Studio OS owns the Experience Engine™.
Companies own Experience DNA™.
Experiences are generated from layered DNA, not handcrafted redesign.
```
