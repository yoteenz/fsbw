# 07 — AI Team Compiler

**Engine Module:** `studio.department-generator.v1.ai-team-compiler`  
**Status:** AI employee assignment system  
**Philosophy:** Every department gets a specialized team. Orb is always present. Concierges are ambient staff.

---

## Design Principle

> The Generator automatically assigns AI employees based on Department DNA — Creative Director for creative departments, Legal Concierge for law firms, Production Manager for production floors. Founders never configure AI staff manually.

---

## Compiler Output

```yaml
AITeamCompileResult:
  departmentId: DepartmentTypeId
  aiTeamManifest: AITeamManifest
  triggerBindings: AITriggerBinding[]
  voiceProfiles: VoiceProfileBinding[]
  zoneAssignments: AIZoneAssignment[]
```

Exported as `ai/ai-team-manifest.json` + `ai/ai-triggers.json`.

---

## Universal Roles

| Role | Presence | Rule |
|------|----------|------|
| **Studio Orb™** | All departments | Physical pedestal — never chat bubble |
| **Chief Concierge** (routing) | All departments | Routes cross-department commands |

---

## Department Team Rosters

### Creative Pipeline

| Department | Required Roles | Optional Roles |
|------------|--------------|----------------|
| creative-direction | Orb · Creative Director · Research Concierge · Brand Concierge | Production Manager |
| discovery | Orb · Research Concierge · Creative Director | Trend Analyst |
| story | Orb · Creative Director · Production Manager | Story Editor |
| production | Orb · Production Manager · Creative Director | Quality Concierge |
| review | Orb · Quality Concierge · Brand Concierge | Creative Director |
| publishing | Orb · Production Manager · Brand Concierge | Growth Concierge |
| marketing | Orb · Growth Concierge · Brand Concierge · Creative Director | Research Concierge |

### Executive & Commerce

| Department | Required Roles |
|------------|--------------|
| executive-hq | Orb · Chief of Staff · Brand Concierge · Experience Concierge |
| marketplace | Orb · Research Concierge · Quality Concierge |

### Industry

| Department | Required Roles |
|------------|--------------|
| law-firm | Orb · Legal Concierge · Brand Concierge |
| medical | Orb · Clinical Concierge · Compliance Concierge |
| restaurant | Orb · Culinary Concierge · Brand Concierge |
| photography | Orb · Creative Director · Research Concierge |
| podcast | Orb · Production Manager · Creative Director |
| education | Orb · Education Concierge · Research Concierge |
| salon | Orb · Experience Concierge · Brand Concierge |
| construction | Orb · Production Manager · Safety Concierge |

---

## AI Team Manifest Schema

```yaml
AITeamManifest:
  version: semver
  departmentId: string
  staff:
    - roleId: AIRoleId
      displayName: string
      zonePresence: string[]        # primary zones
      ambientBehaviors: AmbientBehavior[]
      voiceProfile: VoiceProfileId
      genomeVoiceSlot: voice        # Genome-driven register
      mayApprove: false
      escalationPath: AIRoleId | null
  orbConfig:
    pedestalObjectId: string
    greetingProfiles: GreetingProfile[]
    commandRouting: CommandRoute[]
```

---

## Ambient Behavior Compilation

| Trigger | Example Response |
|---------|------------------|
| Brief section empty | *"Mission isn't pinned yet — want me to draft from Genome?"* |
| Off-brand reference | Observatory pulse · Brand Concierge flag |
| Pending approval | Orb nudge toward Timeline |
| Sandbox branch ready | Creative Director rank alternates |
| Genome divergence | Brand Concierge comparative analysis |

Behaviors compile as `ai-triggers.json` — Runtime Concierge subsystem executes.

---

## Voice Profile Binding

| Genome Company | Orb Tone | Concierge Tone |
|----------------|----------|----------------|
| Luxury beauty | Warm · confident | Sensory · evocative |
| NDX finance | Measured · authoritative | Precise · insight-forward |
| Restaurant | Inviting · craft | Hospitality · sensory |
| Law firm | Formal · strategic | Clarity-first · respectful |

`genomeVoiceSlot: voice` — never hardcoded persona strings in manifest.

---

## Zone Assignment

```yaml
AIZoneAssignment:
  roleId: AIRoleId
  zoneId: string
  presenceType: enum              # primary | ambient | on-demand
  activationVerbs: VerbId[]       # verbs that summon this role
```

| Role | Creative Direction Zones |
|------|-------------------------|
| Creative Director | Brief Wall · Timeline · Mood Wall |
| Research Concierge | Mood Wall · Library |
| Brand Concierge | Observatory · Mood Wall |
| Orb | Command Center → all zones |

---

## Marketplace AI Expansions

Marketplace packages may add:

| Expansion Type | Merge Rule |
|----------------|------------|
| Additional concierge role | Append to optionalAIRoles |
| Voice stem pack | Override voiceProfile by semver |
| Industry specialist | Replace optional role if same category |

---

## Anti-Patterns

| Forbidden | Correct |
|-----------|---------|
| Chat bubble Orb | Physical pedestal object |
| Founder-configured AI roster | DNA-driven assignment |
| AI approve on behalf | Permission gate blocks |
| Unsolicited spam suggestions | Max frequency caps in triggers |

---

_Next: [08 — Audio Compiler](./08_AUDIO_COMPILER.md)_
