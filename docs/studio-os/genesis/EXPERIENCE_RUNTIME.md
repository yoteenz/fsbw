# Experience Runtime™ Architecture

**Canonical source:** `genesis/articles/EXPERIENCE_RUNTIME.md`  
**Content home:** `genesis/experience-runtime/`  
**Parent:** Experience Engine™  
**Status:** Architecture drafted; implementation planned

---

## Purpose

Experience Runtime™ is the execution layer for Experience Engine™.

Experience Engine™ defines the DNA registries and inheritance model. Experience
Runtime™ assembles those definitions into live Studio OS experiences.

```text
Platform DNA
  -> Brand DNA
    -> Department DNA
      -> Scene DNA
        -> Component DNA
          -> Motion DNA
            -> Interaction DNA
              -> State DNA
                -> Runtime Assembly
                  -> Rendered Experience
```

Studio OS pages should become runtime-generated scene graphs instead of manually
constructed screens.

---

## Runtime lifecycle

1. Boot Runtime kernel.
2. Resolve tenant, brand, department, route, scene, user, viewport, preferences.
3. Load Platform, Brand, Department, Scene, Component, Motion, Interaction, and
   State DNA.
4. Validate schemas and version compatibility.
5. Resolve inheritance and governed overrides.
6. Resolve conflicts and fallbacks.
7. Hydrate State DNA.
8. Assemble Runtime Experience Graph™.
9. Project graph into React components, CSS variables, contexts, and
   subscriptions.
10. Observe live DNA/state changes.
11. Apply graph patches without route rebuilds.
12. Persist state and hand off context on teardown.

---

## Live Brand DNA switching

A founder can switch Brand DNA during runtime because:

- Platform template remains mounted.
- Runtime node IDs remain stable.
- State DNA preserves compatible slots.
- Brand DNA recompiles into CSS variables, component variant props, Orb context,
  writing voice, materials, lighting, and motion.
- Runtime applies a graph patch instead of regenerating the page.

During a switch:

```text
Founder selects Brand DNA
  -> validate target DNA versions
  -> resolve new profile against same Platform/Scene/State DNA
  -> compute graph diff
  -> preserve state slots by stable node ID
  -> apply CSS variables and context patches
  -> rebind compatible component variants
  -> update Orb personality
  -> transition atmosphere
```

No route change. No layout regeneration. No state loss.

---

## Case study

One identical Headquarters template generates:

| Brand | Infrastructure | Changed by DNA |
|-------|----------------|----------------|
| Studio OS™ | Same route, zones, components, data loaders, state slots, Orb mount | Marble executive institution, red/gold calm, crystalline Chief of Staff |
| Frontal Slayer™ | Same route, zones, components, data loaders, state slots, Orb mount | Luxury beauty mansion, salon light, concierge warmth |
| NDX™ | Same route, zones, components, data loaders, state slots, Orb mount | Media command floor, broadcast glass, producer/signal analyst Orb |

The validation rule:

```text
Same template.
Same runtime graph.
Same state.
Different inherited DNA.
```

---

## Implementation posture

Do not redesign Experience Engine™. Implement Experience Runtime™ as an
execution layer that consumes the completed Experience Engine registries.

First implementation steps:

1. Add Platform DNA™ and State DNA™ schemas.
2. Add Runtime Assembly Request™ and Runtime Experience Graph™.
3. Wrap `resolveExperienceProfile()` output into runtime graph assembly.
4. Add stable runtime node IDs to shared scene templates.
5. Add State DNA slots to Headquarters/playground templates.
6. Implement live Brand DNA graph patches.
7. Migrate manually composed pages into Runtime scene adapters over time.
