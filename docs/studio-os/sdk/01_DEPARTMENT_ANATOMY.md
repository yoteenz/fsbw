# 01 — Department Anatomy

**SDK Module:** `studio.department.sdk.v1.anatomy`  
**Status:** Mandatory inheritance contract  
**Applies to:** Every department in every industry, forever

---

## Definition

A **Department** is a self-contained interactive world inside a Headquarters Building. It has a spatial envelope, modular objects, AI employees, interaction zones, and defined inputs/outputs to the rest of Studio OS.

Departments inherit this anatomy. **No exceptions.** Custom departments may add specialized objects or AI roles, but may not omit required anatomy fields.

---

## Anatomy Schema

Every department manifest MUST declare all fields below.

```yaml
department:
  id: string                    # globally unique, kebab-case
  version: semver
  sdkVersion: "1.0.0"
  displayName: string           # human label — Genome may override terminology
  building: string              # parent building in HQ hierarchy
  industryTags: string[]        # compatible industries; empty = universal
  maturityLevel: enum           # starter | growth | enterprise

  purpose: string               # one sentence — why this place exists
  responsibilities: string[]    # what work happens here
  inputs: InputPort[]
  outputs: OutputPort[]
  objects: ObjectRef[]
  aiEmployees: AIEmployeeRef[]
  interactionZones: ZoneRef[]
  panels: PanelRef[]
  commands: CommandRef[]
  dependencies: DependencyRef[]
  transitions: TransitionRef[]
  genomeHooks: GenomeHookRef[]
  marketplace: MarketplaceMeta
```

---

## 1. Purpose

**What it is:** A single declarative sentence describing why this department exists in a business Headquarters.

**Rules:**
- Purpose describes **business function**, not visual style.
- Purpose must remain valid across all industries after Genome transformation.
- Purpose is shown to users on **arrival**, not buried in settings.

**Example (Marketing Department):**
> "Plan, produce, approve, and launch brand communications across every channel."

---

## 2. Responsibilities

**What it is:** An ordered list of operational duties performed inside this department.

**Rules:**
- Each responsibility maps to at least one **interaction zone** or **object**.
- Responsibilities are verbs: *approve*, *schedule*, *review*, *publish*, *compare*.
- Maximum 12 responsibilities per department (force focus).

| Responsibility | Maps To |
|----------------|---------|
| Review campaign creative | Approval Station + Creative Director AI |
| Schedule launch | Timeline Table + Production Manager AI |
| Compare channel variants | Preview Screen + Branch interaction |

---

## 3. Inputs

**What it is:** Typed ports through which data, assets, and signals enter the department.

```yaml
InputPort:
  id: string
  type: enum          # project | asset | genome-signal | task | approval | external-api | concierge-message
  source: string      # department id, building, or "headquarters"
  required: boolean
  schema: string      # reference to data contract
  arrivalBehavior: enum   # silent | notify | ceremony | orb-announce
```

**Canonical input types:**

| Type | Description |
|------|-------------|
| `project` | Active Project from Project Model |
| `asset` | Registered asset from Asset Registry™ |
| `genome-signal` | Live Company Genome domain update |
| `task` | Task delegated from another department |
| `approval` | Pending approval from upstream workflow |
| `external-api` | OAuth-connected external system |
| `concierge-message` | Message from another AI employee |

**Rules:**
- Every department declares at least one `project` input.
- Inputs arrive through **physical metaphors** (delivery shelf, inbox pedestal, orb handoff) — not modal dialogs.

---

## 4. Outputs

**What it is:** Typed ports through which completed work leaves the department.

```yaml
OutputPort:
  id: string
  type: enum          # asset | approval | task | project-update | genome-learning | publication
  destination: string
  exitCriteria: string[]    # conditions that must be true
  handoffAnimation: string  # reference to motion standard
```

**Rules:**
- Every department must produce at least one `asset` or `project-update` output.
- Outputs trigger **exit transitions** — work physically leaves via conveyor, portal, or orb dispatch.
- `genome-learning` outputs feed Company Genome™ — departments teach the company identity over time.

---

## 5. Objects

**What it is:** References to object class instances placed in the department spatial layout.

```yaml
ObjectRef:
  classId: string     # from Object Library (03)
  instanceId: string  # unique within department
  zone: string        # interaction zone placement
  required: boolean
  genomeAdaptable: boolean
  replaceable: boolean
```

**Rules:**
- Minimum object set per department: **Entry Marker**, **Orb Pedestal**, **Primary Work Surface**, **Exit Portal**.
- All objects must be independently replaceable (`replaceable: true`) unless safety-critical.
- See [03 — Object Library](./03_OBJECT_LIBRARY.md) for full class definitions.

---

## 6. AI Employees

**What it is:** AI workers assigned to this department with defined roles.

```yaml
AIEmployeeRef:
  roleId: string      # from AI Employee System (05)
  instanceId: string
  primaryZone: string
  escalationTarget: string | null
  permissions: PermissionSet
  memoryScope: enum   # department | organization | project
```

**Rules:**
- Every department has at least one AI employee.
- Every department may host the **Orb** as ambient intelligence.
- AI employees collaborate — no single AI owns the department.
- See [05 — AI Employee System](./05_AI_EMPLOYEE_SYSTEM.md).

---

## 7. Interaction Zones

**What it is:** Bounded spatial regions where specific interaction verbs are active.

```yaml
ZoneRef:
  id: string
  type: enum          # entry | hero | primary | secondary | orb | exit | ceremony
  bounds: SpatialBounds
  allowedVerbs: string[]    # from Interaction Engine (04)
  maxOccupancy: number      # simultaneous interaction contexts
  lightingAnchor: string
```

**Canonical zone types:**

| Zone | Purpose |
|------|---------|
| `entry` | Arrival and orientation |
| `hero` | Department identity and current mission |
| `primary` | Main work surface |
| `secondary` | Supporting tasks, reference, history |
| `orb` | Orb conversation and command relay |
| `exit` | Departure and handoff |
| `ceremony` | Approvals, launches, celebrations |

---

## 8. Panels

**What it is:** Floating information surfaces attached to objects or zones — never full-page layouts.

```yaml
PanelRef:
  id: string
  attachTo: string    # object or zone id
  contentType: enum   # status | preview | metadata | timeline | comparison | chat
  genomeStyled: true  # always true — panels never hardcode brand
  dismissBehavior: enum   # auto | manual | orb-dismiss
```

**Rules:**
- Panels float, slide, or dock — they do not replace the environment.
- Maximum 3 simultaneous visible panels per zone.
- Panel typography, color, and motion come from Genome injection only.

---

## 9. Commands

**What it is:** Executable actions available in this department, surfaced through Command Dock™, Orb, or object affordances.

```yaml
CommandRef:
  id: string
  label: string       # Genome may override terminology
  verb: string        # interaction verb
  targetObject: string | null
  requiredPermission: string
  dockVisible: boolean
  orbVisible: boolean
```

**Rules:**
- Commands are **verbs on objects**, not menu items.
- All commands register with Command Dock™ capability index.
- Natural language triggers map to commands via concierge routing.

---

## 10. Dependencies

**What it is:** Other departments, services, or platform modules required for this department to function.

```yaml
DependencyRef:
  id: string
  type: enum          # department | platform-module | external-service | asset-package
  required: boolean
  fallbackBehavior: enum   # degrade | block | redirect
```

**Common dependencies:**
- Asset Registry™ (asset storage)
- Company Genome™ (identity injection)
- Project Model (project context)
- Interaction Engine™ (behavioral consistency)
- Specific upstream departments (e.g., Creative → Marketing handoff)

---

## 11. Transitions

**What it is:** Defined motion and state changes between department modes.

```yaml
TransitionRef:
  id: string
  from: string        # state or zone
  to: string
  trigger: enum       # user-action | ai-signal | project-event | genome-update | timer
  motionProfile: string   # reference to Motion Standard (08)
  audioProfile: string    # reference to Audio Standard (09)
```

**Canonical transitions:**

| Transition | Trigger |
|------------|---------|
| Arrival | User enters department |
| Focus Mode | User engages primary zone |
| Approval Ceremony | Approval verb completed |
| Launch Celebration | Output port satisfied |
| Departure | User exits to another location |
| Genome Refresh | Company Genome domain update |

---

## 12. Genome Hooks

**What it is:** Injection points where Company Genome™ transforms department appearance and behavior.

```yaml
GenomeHookRef:
  domain: string      # genome domain id
  targets: string[]   # objects, zones, panels, or AI roles affected
  priority: number
  fallback: string    # SDK default if genome domain empty
```

**Mandatory hooks (every department):**
- `colorPrinciples` → materials, glass tint, particle color
- `materialLanguage` → surfaces, furniture, pedestals
- `lightingStyle` → zone lighting anchors
- `typography` / `editorialDirection` → panels
- `voice` / `microcopyStyle` → AI employees, panel labels
- `motionPhilosophy` → transitions
- `musicStyle` / `soundDesign` → ambient audio
- `terminology` → department display name, command labels

See [10 — Company Genome Integration](./10_COMPANY_GENOME_INTEGRATION.md).

---

## 13. Marketplace Compatibility

**What it is:** Metadata declaring how this department can be packaged and installed.

```yaml
MarketplaceMeta:
  packagable: boolean         # must be true
  license: enum               # studio | commercial | enterprise
  installType: enum           # department-pack | expansion-pack
  compatibilityMatrix: string[]   # sdk versions, genome versions
  tags: string[]
  previewAssets: string[]     # hero thumbnail, tour clip
```

**Rules:**
- `packagable: true` is mandatory for all SDK-compliant departments.
- Marketplace packages never include company-specific branding.
- Installation merges anatomy into target Headquarters per Install Engine.

See [13 — Marketplace Packaging](./13_MARKETPLACE_PACKAGING.md).

---

## Inheritance Contract

When authoring a new department:

1. Copy the anatomy schema template.
2. Fill every required field.
3. Add industry-specific objects and AI roles as extensions — never omissions.
4. Validate against [17 — QA Checklist](./17_QA_CHECKLIST.md).
5. Register anatomy manifest in Department Runtime catalog.

**Forbidden:**
- Departments without Orb zone
- Departments without exit portal
- Departments with hardcoded brand colors
- Departments with flattened scene assets
- Departments with form-only primary interaction

---

## Example: Marketing Department Anatomy (Abbreviated)

```yaml
department:
  id: marketing
  version: "1.0.0"
  sdkVersion: "1.0.0"
  displayName: "Marketing"
  building: creative-wing
  industryTags: []            # universal
  maturityLevel: starter

  purpose: "Plan, produce, approve, and launch brand communications across every channel."

  responsibilities:
    - Review campaign creative
    - Compare channel variants
    - Approve launch materials
    - Schedule publication
    - Track campaign performance signals

  inputs:
    - { id: active-project, type: project, source: headquarters, required: true, arrivalBehavior: orb-announce }
    - { id: creative-assets, type: asset, source: creative-department, required: false, arrivalBehavior: notify }
    - { id: brand-signals, type: genome-signal, source: company-genome, required: true, arrivalBehavior: silent }

  outputs:
    - { id: approved-campaign, type: asset, destination: distribution-department, exitCriteria: [approved, scheduled] }
    - { id: genome-campaign-learning, type: genome-learning, destination: company-genome, exitCriteria: [launched] }

  objects:
    - { classId: floating-panel, instanceId: campaign-status, zone: hero, required: true, genomeAdaptable: true, replaceable: true }
    - { classId: timeline-table, instanceId: launch-schedule, zone: primary, required: true, genomeAdaptable: true, replaceable: true }
    - { classId: approval-station, instanceId: launch-approval, zone: ceremony, required: true, genomeAdaptable: true, replaceable: true }
    - { classId: preview-screen, instanceId: channel-preview, zone: secondary, required: true, genomeAdaptable: true, replaceable: true }
    - { classId: orb-pedestal, instanceId: marketing-orb, zone: orb, required: true, genomeAdaptable: true, replaceable: false }

  aiEmployees:
    - { roleId: marketing-concierge, instanceId: mc-01, primaryZone: primary, escalationTarget: brand-concierge, permissions: [review, approve, schedule], memoryScope: organization }
    - { roleId: brand-concierge, instanceId: bc-01, primaryZone: ceremony, escalationTarget: null, permissions: [approve, reject, genome-veto], memoryScope: organization }

  interactionZones:
    - { id: entry, type: entry, allowedVerbs: [navigate, speak] }
    - { id: hero, type: hero, allowedVerbs: [preview, pin, speak] }
    - { id: primary, type: primary, allowedVerbs: [drag, pin, annotate, compare, scrub, approve] }
    - { id: ceremony, type: ceremony, allowedVerbs: [approve, reject, branch] }
    - { id: orb, type: orb, allowedVerbs: [speak, orb-conversation, command] }
    - { id: exit, type: exit, allowedVerbs: [navigate, reference-drop] }

  genomeHooks:
    - { domain: colorPrinciples, targets: [all-objects], priority: 1 }
    - { domain: materialLanguage, targets: [furniture, surfaces], priority: 1 }
    - { domain: voice, targets: [marketing-concierge, brand-concierge], priority: 2 }
    - { domain: terminology, targets: [displayName, commands], priority: 3 }
```

---

_Next: [02 — Spatial Layout System](./02_SPATIAL_LAYOUT_SYSTEM.md)_
