# Experience Runtime™

**Project:** Studio OS  
**System:** Experience Runtime™  
**Status:** Canonical architecture draft for Genesis review  
**Version:** 1.0.0  
**Authority:** Genesis.md  
**Parent:** Genesis™ · Experience Engine™ · Studio OS Design DNA™  
**Depends on:** Experience Engine™, Platform DNA™, Brand DNA™, Department DNA™, Scene DNA™, Component DNA™, Motion DNA™, Interaction DNA™, State Engine™, Universal Interaction Model™, Component Registry™, Design Token Engine™, Orb™, Multi-Tenant Workspace Runtime™  
**Constitutional posture:** Studio OS does not manually construct experiences. Studio OS assembles experiences at runtime from layered architectural definitions.

---

## 0. Prime directive

```text
Do not redesign the Experience Engine™.

Define how the Experience Engine™ executes.
```

Experience Engine™ owns the registries, schemas, inheritance model, validators,
and resolved Experience DNA™.

Experience Runtime™ owns real-time execution:

- loading DNA
- resolving inheritance
- preserving state
- assembling scenes
- binding components
- applying motion and interaction
- switching brands live
- rendering the final experience

The Runtime is the execution layer that turns DNA into a living operating
environment.

### 0.1 Game engine analogy

Experience Runtime™ behaves like a game engine:

| Game engine concept | Experience Runtime™ equivalent |
|---------------------|--------------------------------|
| Engine core | Platform Runtime Kernel™ |
| Assets | DNA registries, components, motion presets, materials, icons |
| Scene graph | Runtime Experience Graph™ |
| Entity/component system | Component DNA + State DNA binding |
| Render loop | Experience Assembly Loop™ |
| Materials/shaders | Glass, lighting, material, token bindings |
| Input system | Interaction DNA + Universal Interaction Model™ |
| Save state | State DNA + runtime session snapshot |
| Hot reload | Live DNA switching without layout regeneration |

The Runtime must never treat pages as static documents. A page is a generated
scene inside a continuously resolved experience graph.

---

## 1. Runtime hierarchy

The permanent execution hierarchy is:

```text
Experience Runtime™
  -> Platform DNA™
    -> Brand DNA™
      -> Department DNA™
        -> Scene DNA™
          -> Component DNA™
            -> Motion DNA™
              -> Interaction DNA™
                -> State DNA™
                  -> Runtime Assembly
                    -> Rendered Experience™
```

### 1.1 Layer responsibilities

| Layer | Runtime responsibility | Mutable during session? |
|-------|------------------------|-------------------------|
| **Experience Runtime™** | Kernel, lifecycle, assembly loop, caches, live updates, state preservation. | No |
| **Platform DNA™** | Shared platform infrastructure: route anatomy, layout primitives, accessibility floor, scene graph contracts. | No |
| **Brand DNA™** | Company-wide atmosphere, color, typography, glass, lighting, materials, particles, voice, Orb, navigation. | Yes, through governed live switch |
| **Department DNA™** | Operational wing expression inherited from Brand DNA. | Yes, per route/workspace switch |
| **Scene DNA™** | Scene template, zones, hero object, capability panels, object graph, density, environmental rules. | Rare; layout-preserving updates only during session |
| **Component DNA™** | Shared component anatomy variants and brand-safe bindings. | Yes, if anatomy remains stable |
| **Motion DNA™** | Motion pacing, transitions, reduced-motion equivalents, sequence contracts. | Yes |
| **Interaction DNA™** | Hover, focus, select, loading, success, warning, approval, escalation. | Yes |
| **State DNA™** | Runtime state schema, persistence scope, hydration rules, state migration, continuity guarantees. | Yes |
| **Runtime Assembly** | Resolved experience graph compiled into renderable props, CSS variables, context, and subscriptions. | Continuous |
| **Rendered Experience™** | The live Headquarters/page/room/workspace/panel/workflow/application. | Continuous |

---

## 2. Experience Runtime™ kernel

Experience Runtime™ is a platform-owned kernel with five primary subsystems:

1. **DNA Loader™** — fetches Platform, Brand, Department, Scene, Component,
   Motion, Interaction, and State DNA for the current tenant/route/user context.
2. **Inheritance Resolver™** — merges layers into a Resolved Experience Profile™
   without mutating source DNA.
3. **Assembly Orchestrator™** — builds the Runtime Experience Graph™ from scene
   templates, component anatomy, data bindings, Orb context, and state slots.
4. **Render Adapter™** — projects resolved graph nodes into React components,
   CSS variables, context providers, and runtime event subscriptions.
5. **Live Update Coordinator™** — applies DNA changes, theme switches, state
   hydration, cache invalidation, and visual transitions without full page
   rebuilds.

### 2.1 Runtime boundaries

The Runtime may:

- select and assemble registered components
- bind DNA values to component props and CSS variables
- create runtime scene graphs
- preserve and migrate state
- swap brand/department/motion/interaction profiles live
- invalidate caches when DNA versions change

The Runtime may not:

- invent brand styles outside Brand DNA
- hardcode department aesthetics
- fork component anatomy for a tenant
- mutate canonical DNA files during render
- rebuild a route just to change atmosphere
- discard user state during a brand switch

---

## 3. Runtime pipeline

The canonical pipeline is:

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

### 3.1 Pipeline stages

| Stage | Input | Output |
|-------|-------|--------|
| 1. Runtime request | route, tenant, user, department, scene, state snapshot | Runtime Assembly Request™ |
| 2. Platform DNA load | platform contracts, scene primitives, component anatomy | Platform Assembly Context™ |
| 3. Brand DNA load | tenant/brand identity profile | Brand Assembly Context™ |
| 4. Department DNA load | operational wing overlay | Department Assembly Context™ |
| 5. Scene DNA bind | scene template + route/workspace capability map | Scene Assembly Plan™ |
| 6. Component DNA bind | registered component variants + anatomy constraints | Component Assembly Plan™ |
| 7. Motion DNA bind | motion profile + reduced-motion branch | Motion Assembly Plan™ |
| 8. Interaction DNA bind | interaction states + event contracts | Interaction Assembly Plan™ |
| 9. State DNA hydrate | state schema + session snapshot + persistence scope | Runtime State Graph™ |
| 10. Runtime assembly | all resolved layers | Runtime Experience Graph™ |
| 11. Render projection | graph nodes + bindings | Rendered Experience™ |

### 3.2 Runtime Assembly Request™

```ts
type RuntimeAssemblyRequest = {
  tenantId: string;
  brandId: string;
  routeId: string;
  departmentId: string;
  sceneId: string;
  userId?: string;
  sessionId: string;
  viewport: RuntimeViewport;
  accessibility: RuntimeAccessibilityPreferences;
  stateSnapshotRef?: string;
  dnaVersionPolicy: 'stable' | 'latest-approved' | 'preview';
};
```

### 3.3 Runtime Experience Graph™

```ts
type RuntimeExperienceGraph = {
  graphId: string;
  request: RuntimeAssemblyRequest;
  dnaVersions: RuntimeDnaVersionMap;
  platformContext: PlatformAssemblyContext;
  brandContext: BrandAssemblyContext;
  departmentContext: DepartmentAssemblyContext;
  scenePlan: SceneAssemblyPlan;
  componentPlan: ComponentAssemblyPlan;
  motionPlan: MotionAssemblyPlan;
  interactionPlan: InteractionAssemblyPlan;
  stateGraph: RuntimeStateGraph;
  renderTree: RuntimeRenderNode[];
  cssVariables: Record<string, string>;
  orbContext: RuntimeOrbContext;
  cacheKeys: RuntimeCacheKey[];
  compliance: RuntimeComplianceResult;
};
```

The graph is the runtime source of truth for the current rendered experience.
React is an adapter. The route is an entry point. The graph is the experience.

---

## 4. Runtime lifecycle

### 4.1 Lifecycle phases

```text
Boot
  -> Context resolution
  -> DNA loading
  -> Schema validation
  -> Inheritance resolution
  -> Conflict resolution
  -> State hydration
  -> Runtime graph assembly
  -> Render projection
  -> Interaction binding
  -> Live observation
  -> DNA/state updates
  -> Teardown or handoff
```

### 4.2 Phase definitions

| Phase | Runtime behavior |
|-------|------------------|
| **Boot** | Load Runtime kernel, platform defaults, registry indexes, cache metadata. |
| **Context resolution** | Resolve tenant, company, brand, department, route, scene, user, viewport, preferences. |
| **DNA loading** | Load approved DNA versions from registries using context. |
| **Schema validation** | Validate required fields, version compatibility, accessibility floor, component anatomy constraints. |
| **Inheritance resolution** | Merge Platform → Brand → Department → Scene → Component → Motion → Interaction → State without mutating sources. |
| **Conflict resolution** | Apply precedence rules, governed overrides, safety gates, and fallbacks. |
| **State hydration** | Restore state using State DNA schema and migrate if DNA versions changed. |
| **Runtime graph assembly** | Build scene zones, component nodes, data bindings, interaction handlers, motion bindings, Orb context. |
| **Render projection** | Apply CSS variables and component props to render adapters. |
| **Interaction binding** | Subscribe nodes to Universal Interaction Model events and workflow/state transitions. |
| **Live observation** | Watch DNA registry version changes, founder switcher commands, state mutations, viewport/preferences. |
| **DNA/state updates** | Patch the graph, rebind variables/props, preserve compatible state, transition atmosphere. |
| **Teardown or handoff** | Persist state snapshot, clean subscriptions, retain warm caches, hand off Orb context. |

### 4.3 Runtime loop

The Runtime loop is event-driven, not animation-frame heavy:

```text
event arrives
  -> classify event
  -> determine affected DNA/state layers
  -> compute graph patch
  -> validate patch
  -> apply state-preserving update
  -> render only affected nodes
  -> record audit/provenance
```

Motion systems may use animation frames, but DNA resolution should be memoized
and event-scoped.

---

## 5. Assembly order

The Runtime always assembles in dependency order:

1. **Platform skeleton** — route shell, scene zones, layout grid, accessibility
   floor, data slots, Orb mount contract.
2. **Brand atmosphere** — color, type, glass, lighting, material, particle,
   voice, navigation tone, Orb personality.
3. **Department translation** — department color/mood, operating vocabulary,
   local density, wing-specific lighting, notification tone.
4. **Scene template** — object graph, hero object, capability panels, navigation
   landmarks, environmental narrative.
5. **Component anatomy** — select canonical component types and brand variants
   without changing node identity.
6. **Motion binding** — entrance, route transition, hover/focus, loading,
   reduced-motion branch.
7. **Interaction binding** — UIM events, feedback states, confirmations,
   approvals, warnings, escalation.
8. **State hydration** — restore form/workflow/panel/orb/session state into
   stable node IDs.
9. **Render commit** — apply variables, props, providers, subscriptions.

### 5.1 Stable node identity rule

Every runtime node must have a stable identity independent of Brand DNA:

```text
runtimeNodeId = platformTemplateId + sceneNodeId + componentRole + stateSlotId
```

Brand DNA may change the node's expression. It must not change the node's
identity.

This rule enables live brand switching without losing state.

---

## 6. Inheritance rules

### 6.1 Default inheritance law

```text
Platform DNA provides structure.
Brand DNA provides identity.
Department DNA provides operational translation.
Scene DNA provides environment.
Component DNA provides object expression.
Motion DNA provides movement.
Interaction DNA provides response.
State DNA provides continuity.
```

Lower layers may specialize higher layers, but they may not invalidate higher
layer constraints.

### 6.2 Merge semantics

| Data shape | Merge rule |
|------------|------------|
| Scalar values | Lower layer overrides only if field is explicitly overrideable. |
| Objects | Deep merge by schema; protected keys remain from higher layer. |
| Arrays | Merge by stable `id`, not by index. |
| Tokens | Resolve through token aliases; never inline unknown values. |
| Component variants | Select registered variant; never fork anatomy. |
| Motion presets | Lower layer can adjust pacing/intensity within accessibility bounds. |
| Interaction states | Must inherit Universal Interaction Model required states. |
| State slots | Preserve by stable node ID and State DNA migration rules. |

### 6.3 Protected invariants

These may not be overridden by Brand/Department/Scene DNA:

- route access control
- tenant isolation
- accessibility floor
- keyboard/focus behavior minimums
- semantic landmarks
- data authorization
- audit requirements
- workflow state machine integrity
- component anatomy identity
- Orb safety boundaries
- State DNA migration contract

---

## 7. Override rules

### 7.1 Override classes

| Class | Meaning | Example |
|-------|---------|---------|
| **Soft override** | Allowed expression change inside schema bounds. | Brand changes glass tint. |
| **Bounded override** | Allowed only within numeric/semantic limits. | Motion duration changes within approved range. |
| **Governed override** | Requires approved DNA version or Genesis rule. | Department changes scene density beyond default. |
| **Forbidden override** | Never allowed at runtime. | Brand removes keyboard focus states. |

### 7.2 Override decision order

```text
Is the target field overrideable?
  -> no: reject and use parent value
  -> yes: is override within schema bounds?
    -> no: use fallback or parent value
    -> yes: does override require governance?
      -> yes: require approved DNA version
      -> no: apply override
```

### 7.3 Override provenance

Every resolved field should be traceable:

```ts
type RuntimeResolvedField<T> = {
  value: T;
  sourceLayer: 'platform' | 'brand' | 'department' | 'scene' | 'component' | 'motion' | 'interaction' | 'state';
  sourceId: string;
  sourceVersion: string;
  overriddenFrom?: RuntimeResolvedField<T>;
  governanceRef?: string;
};
```

The Runtime must be able to explain why a rendered experience looks and behaves
the way it does.

---

## 8. Conflict resolution

### 8.1 Conflict classes

| Conflict | Example | Runtime response |
|----------|---------|------------------|
| Schema conflict | Brand references unknown material preset. | Reject field, use nearest parent/default. |
| Accessibility conflict | Brand contrast below floor. | Auto-adjust within palette or fall back. |
| Anatomy conflict | Scene requests unregistered panel anatomy. | Use canonical component or block scene. |
| Motion conflict | Motion DNA violates reduced-motion preference. | Switch to reduced-motion branch. |
| Interaction conflict | Component lacks focus state. | Inject platform focus state. |
| State conflict | Saved state no longer matches State DNA schema. | Migrate, quarantine invalid fields, preserve valid slots. |
| Version conflict | Brand DNA version incompatible with Scene DNA. | Resolve to latest compatible approved pair. |
| Tenant conflict | DNA references another tenant asset. | Reject reference and audit. |

### 8.2 Precedence

1. Security and tenant isolation
2. Accessibility
3. Platform DNA invariants
4. State integrity
5. Approved Brand DNA
6. Department DNA
7. Scene DNA
8. Component DNA
9. Motion DNA
10. Interaction DNA
11. User/session preferences

User preferences may override expression only where they improve accessibility
or comfort. They may not weaken security or platform invariants.

### 8.3 Conflict artifact

```ts
type RuntimeConflict = {
  conflictId: string;
  severity: 'info' | 'warning' | 'blocking';
  layer: string;
  fieldPath: string;
  attemptedValue: unknown;
  resolvedValue: unknown;
  ruleId: string;
  action: 'applied' | 'fallback' | 'auto-corrected' | 'blocked';
  auditMessage: string;
};
```

---

## 9. Fallback behavior

Fallbacks must be deterministic and visible to diagnostics.

### 9.1 Fallback ladder

```text
Requested layer value
  -> approved same-layer fallback
  -> parent layer value
  -> platform default
  -> safe minimal experience
```

### 9.2 Safe minimal experience

If a full experience cannot assemble, Runtime renders a safe minimal shell:

- tenant-safe route shell
- readable typography
- accessible contrast
- no custom particles or complex motion
- platform focus/interaction states
- Orb in diagnostic mode
- audit message for missing/invalid DNA

The user should not see a broken page because a Brand DNA field is invalid.

---

## 10. State DNA™

State DNA™ is the continuity layer that lets experiences change identity without
losing work.

### 10.1 Responsibilities

State DNA defines:

- stable state slots
- persistence scope
- hydration order
- migration rules
- optimistic update rules
- reset boundaries
- state privacy
- cross-route handoff
- live switch preservation guarantees

### 10.2 State DNA schema

```ts
type StateDna = {
  stateDnaId: string;
  version: string;
  sceneId: string;
  slots: RuntimeStateSlot[];
  persistence: {
    scope: 'ephemeral' | 'session' | 'workspace' | 'tenant' | 'user';
    storage: 'memory' | 'local' | 'remote' | 'hybrid';
    encryptionRequired: boolean;
  };
  hydration: {
    order: string[];
    blockingSlots: string[];
    optimisticSlots: string[];
  };
  migrations: RuntimeStateMigration[];
  liveSwitchPolicy: {
    preserveSlots: string[];
    resetSlots: string[];
    revalidateSlots: string[];
  };
};
```

### 10.3 State preservation rule

Brand switching may update visual expression, motion, materials, copy voice, and
Orb personality. It must preserve:

- form values
- selected tabs
- scroll anchors where possible
- workflow progress
- panel expansion state
- data filters
- in-progress Orb conversation context
- unsaved user inputs

It may reset:

- purely decorative animation state
- particles
- brand-specific cinematic sequences
- nonessential hover/focus transient state

---

## 11. Caching strategy

### 11.1 Cache layers

| Cache | Key | Contents | Invalidation |
|-------|-----|----------|--------------|
| Registry index cache | tenant + registry version | DNA IDs and versions | Registry publish |
| Resolved DNA cache | tenant + brand + department + scene + versions | Merged profile | Any involved DNA version change |
| Component plan cache | scene + component registry version + brand version | Component variants and props | Component/Brand DNA change |
| CSS variable cache | resolved profile hash | Token/material/lighting variables | Brand/Department/Motion change |
| Motion plan cache | motion version + accessibility prefs | Motion presets | Motion DNA or prefers-reduced-motion |
| State snapshot cache | session + state DNA version | Runtime state graph | State mutation or migration |
| Render graph cache | request hash + DNA versions | Runtime Experience Graph | Any dependency patch |

### 11.2 Cache principles

- Cache resolved products, not source DNA mutation.
- Cache keys must include DNA versions.
- Live preview may use preview caches isolated from approved production caches.
- Cross-tenant caches may store platform primitives only, never tenant DNA.
- State snapshots are separate from visual DNA caches.

---

## 12. Performance strategy

Experience Runtime™ must feel immediate even when DNA is layered.

### 12.1 Performance rules

1. Resolve inheritance once per graph version, not per component render.
2. Apply brand changes through CSS variables and context patching before
   component remounting.
3. Keep node identity stable across DNA changes.
4. Split heavy scene assets by scene and brand material pack.
5. Preload likely Brand DNA profiles in playground/founder switchers.
6. Use shallow graph patches for live updates.
7. Defer decorative particles and cinematic effects until core content is
   interactive.
8. Respect reduced-motion and low-power preferences as performance wins.
9. Persist state snapshots incrementally.
10. Keep Orb context warm across route and brand switches.

### 12.2 Render budget priorities

```text
1. Security and route shell
2. Readable content
3. State hydration
4. Interaction readiness
5. Brand atmosphere
6. Motion
7. Particles/cinematic extras
```

Atmosphere can enhance after content is usable. The Runtime must never block
core work on decorative expression.

---

## 13. Theme and live DNA switching

### 13.1 Live Brand DNA switching

A founder can switch Brand DNA during runtime without rebuilding pages because:

1. The platform template remains mounted.
2. Runtime node IDs remain stable.
3. State DNA preserves compatible slots.
4. Brand DNA recompiles into CSS variables, material bindings, voice context,
   Orb context, and component variant props.
5. The Runtime applies a graph patch instead of regenerating the route.

### 13.2 Switch pipeline

```text
Founder selects Brand DNA
  -> Live Update Coordinator receives dna.switch.brand
  -> load target Brand DNA and compatible overlays
  -> validate target versions
  -> resolve new profile against same Platform/Scene/State DNA
  -> compute graph diff
  -> preserve State DNA slots by stable node ID
  -> apply CSS variable + context patch
  -> rebind component variants where anatomy is compatible
  -> update Orb personality context
  -> run transition from old atmosphere to new atmosphere
  -> audit switch
```

### 13.3 No-rebuild guarantee

During a live Brand DNA switch:

- route does not change
- scene template ID does not change
- component node IDs do not change
- state slots do not change
- data loaders do not refetch unless Brand DNA changes content policy
- React remounts are limited to incompatible variant islands

### 13.4 Transition behavior

The Runtime should not abruptly repaint the world. It should perform an
atmosphere transition:

1. Freeze interaction-critical state.
2. Crossfade lighting and material variables.
3. Update typography and color variables.
4. Rebind component variants.
5. Update Orb glow/personality.
6. Resume interactions.

The transition must have a reduced-motion equivalent.

---

## 14. Live updates beyond brand switching

Experience Runtime™ supports live updates from multiple sources:

| Source | Example | Runtime behavior |
|--------|---------|------------------|
| Founder switcher | Change Brand DNA in playground. | Graph patch + state preservation. |
| Registry publish | Approved Brand DNA version released. | Notify, warm cache, switch on policy. |
| Department context | Move from Executive HQ to Institute of Knowledge. | Re-resolve Department/Scene overlays. |
| Viewport change | Desktop to mobile. | Rebind layout constraints, preserve state slots. |
| Accessibility preference | Reduced motion enabled. | Swap motion branch immediately. |
| Workflow event | Approval completed. | Update interaction/state DNA-driven feedback. |
| Orb action | Orb opens recommendation panel. | Update graph state slot and context. |

Live updates must always produce an auditable Runtime Graph Patch™.

---

## 15. Versioning

### 15.1 DNA version map

Every Rendered Experience™ has a full version map:

```ts
type RuntimeDnaVersionMap = {
  platformDna: string;
  brandDna: string;
  departmentDna: string;
  sceneDna: string;
  componentDna: string;
  motionDna: string;
  interactionDna: string;
  stateDna: string;
  runtimeKernel: string;
};
```

### 15.2 Compatibility rules

- Platform DNA declares supported schema versions.
- Brand DNA declares compatible Platform DNA and component registries.
- Scene DNA declares required component anatomy and state slots.
- State DNA declares migrations between versions.
- Motion/Interaction DNA declare required UIM capabilities.
- Runtime Kernel refuses incompatible blocking combinations.

### 15.3 Runtime version policy

| Policy | Behavior |
|--------|----------|
| **stable** | Use currently approved production DNA versions. |
| **latest-approved** | Use newest approved compatible versions. |
| **preview** | Use draft/preview DNA in isolated founder/admin preview only. |

Production user sessions should not silently jump to incompatible DNA. The
Runtime may warm caches for new versions and switch at a safe boundary.

---

## 16. Runtime contracts

### 16.1 Component contract

Every component consumed by Runtime must declare:

- stable component ID
- anatomy slots
- state slots
- supported variants
- required tokens
- supported interaction states
- accessibility contract
- motion hooks
- data dependencies

### 16.2 Scene contract

Every scene consumed by Runtime must declare:

- scene template ID
- zones
- node IDs
- allowed component roles
- state slots
- Orb placement contract
- navigation landmarks
- density policy
- fallback shell

### 16.3 Brand contract

Every Brand DNA consumed by Runtime must declare:

- identity
- color system
- typography
- glass
- lighting
- motion
- materials
- particles
- icons
- writing voice
- Orb overrides
- navigation style
- experience rules
- compatibility range

---

## 17. Case study: one Headquarters template, three brands

### 17.1 Shared Platform DNA

All three experiences use the same Headquarters template:

```text
headquarters-template-v1
  -> arrival stage
  -> executive summary
  -> department rail
  -> capability grid
  -> priority ribbon
  -> Orb mount
  -> activity/provenance panel
```

The template owns infrastructure:

- route anatomy
- layout zones
- state slots
- data loaders
- accessibility landmarks
- component roles
- Orb mount point
- workflow hooks

It does not own brand expression.

### 17.2 Studio OS™ generated Headquarters

| Layer | Resolved expression |
|-------|---------------------|
| Brand DNA | Marble executive institution, red/gold constitutional calm. |
| Department DNA | Executive wing uses archival intelligence and leadership clarity. |
| Scene DNA | Headquarters as living institution command hall. |
| Component DNA | Clear executive glass, precise labels, constitutional cards. |
| Motion DNA | Calm ceremonial reveal. |
| Interaction DNA | Quiet confidence, gold approvals, red critical states. |
| State DNA | Same state slots as every other brand. |

### 17.3 Frontal Slayer™ generated Headquarters

| Layer | Resolved expression |
|-------|---------------------|
| Brand DNA | Luxury beauty mansion, salon mirror light, concierge warmth. |
| Department DNA | Executive wing becomes founder-led beauty operations suite. |
| Scene DNA | Same Headquarters zones, expressed as mansion command salon. |
| Component DNA | Glossy glass, crimson/gold accents, editorial product polish. |
| Motion DNA | Polished reveal, soft shimmer, confident pace. |
| Interaction DNA | Concierge tactile feedback, glamorous confirmation states. |
| State DNA | Same state slots as every other brand. |

### 17.4 NDX™ generated Headquarters

| Layer | Resolved expression |
|-------|---------------------|
| Brand DNA | Media command floor, broadcast screens, editorial urgency. |
| Department DNA | Executive wing becomes signal strategy desk. |
| Scene DNA | Same Headquarters zones, expressed as newsroom command center. |
| Component DNA | Darker acrylic, signal badges, editorial metadata panels. |
| Motion DNA | Switcher cuts, ticker pulses, crisp transitions. |
| Interaction DNA | Producer-style feedback, urgent-but-controlled alerts. |
| State DNA | Same state slots as every other brand. |

### 17.5 Validation

The case study passes when:

- the Headquarters template ID remains identical
- runtime node IDs remain identical
- component anatomy remains identical
- State DNA slots remain identical
- route and data loaders remain identical
- only inherited DNA expression changes

```text
Same infrastructure.
Same scene graph.
Same state.
Different experience identity.
```

---

## 18. Implementation posture

Experience Runtime™ should be implemented incrementally without disrupting the
completed Experience Engine™:

1. Define Platform DNA and State DNA schemas.
2. Introduce Runtime Assembly Request™ and Runtime Experience Graph™.
3. Wrap existing `resolveExperienceProfile()` output as the Brand/Department/
   Scene/Component/Motion/Interaction portion of the graph.
4. Add stable runtime node IDs to shared scene templates.
5. Add State DNA slots to playground/headquarters templates.
6. Implement graph patching for live Brand DNA switching.
7. Move pages from manual composition to Runtime scene adapters over time.

The first implementation should prove:

- same template
- same runtime graph
- three Brand DNA profiles
- state preserved while switching
- no route rebuild
- no manual brand styling

---

## 19. Canon rule

```text
Experience Engine™ defines what experiences are made from.

Experience Runtime™ defines how experiences execute.

Studio OS pages, Headquarters, departments, rooms, workspaces, scenes, panels,
workflows, and applications must become Runtime-assembled experiences, not
manually constructed screens.
```

This is the execution layer that powers every future Studio OS experience.
