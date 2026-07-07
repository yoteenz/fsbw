# 02 — Walk Modes

**Engine Module:** `studio.adaptive-walk.v1.walk-modes`  
**Status:** Dynamic walkthrough type registry  
**Philosophy:** Different days require different walks.

---

## Walk Mode Registry

| Mode | ID | When |
|------|-----|------|
| **Morning Brief™** | `morning-brief` | Default daily walk — balanced executive orientation |
| **Launch Day™** | `launch-day` | Major launch within 24h — publishing/marketing focus |
| **Creative Sprint™** | `creative-sprint` | Creative pipeline dominant · direction-heavy day |
| **Operations Day™** | `operations-day` | CX · support · inventory · finance emphasis |
| **Crisis Mode™** | `crisis-mode` | Urgent issues — blockers · alerts · customer crises |
| **Celebration Mode™** | `celebration-mode` | Major wins · milestones · revenue achievements |
| **Innovation Day™** | `innovation-day` | Marketplace · experiments · research · new AI capabilities |

Modes are **not** manually selected by default — Mode Resolution (03) assigns. Founder may override (09).

---

## Morning Brief™

```yaml
MorningBriefMode:
  id: morning-brief
  description: Normal daily walkthrough — balanced priorities
  defaultWhen: no higher-priority mode triggers

  typicalStops:
    - creative-direction
    - production
    - marketing
    - publishing
    - customer-experience
    - marketplace
    - operations
    - analytics-observatory

  stopCount: 5-9                         # adaptive trim
  duration: 15-25min
  orbTone: warm · calm · informative
  hqAtmosphere: balanced · genome-normal
```

Balanced path. Priority scorer trims to top stops. **Default** when no launch · crisis · or celebration dominates.

---

## Launch Day™

```yaml
LaunchDayMode:
  id: launch-day
  description: Launch is highest priority — preparation and readiness
  triggers:
    - launchEvent within 24h
    - founderOverride: "focus on launch"

  primaryStops:
    - publishing
    - marketing
    - review
    - production
    - analytics-observatory

  deemphasized:
    - marketplace
    - innovation-lab
    - non-launch projects

  stopCount: 4-6
  duration: 12-20min
  orbTone: focused · energetic · confident
  hqAtmosphere: elevated-activity · countdown-visible
```

Orb example:

> "Today's launch is our highest priority. I've already prepared Marketing, Publishing, and Review."

---

## Creative Sprint™

```yaml
CreativeSprintMode:
  id: creative-sprint
  description: Creative pipeline and direction dominate
  triggers:
    - multiple active creative projects
    - creative approvals queue depth
    - founder habit: creative-first mornings

  primaryStops:
    - creative-direction
    - mood-board-zones
    - story-department
    - photography
    - production-preview

  stopCount: 4-7
  orbTone: inspired · collaborative
  hqAtmosphere: creative-energy · mood-walls-active
```

---

## Operations Day™

```yaml
OperationsDayMode:
  id: operations-day
  description: Running the business — CX · support · ops · finance
  triggers:
    - support queue elevation
    - inventory/finance signals
    - scheduled ops review

  primaryStops:
    - operations
    - customer-experience
    - support
    - inventory
    - finance

  stopCount: 4-6
  orbTone: practical · clear
  hqAtmosphere: steady · service-focused
```

---

## Crisis Mode™

```yaml
CrisisModeMode:
  id: crisis-mode
  description: Urgent issues only — nothing else until resolved
  triggers:
    - critical system alert
    - production blocker on launch-critical project
    - VIP customer crisis
    - revenue/regulatory emergency

  primaryStops: dynamic              # only crisis-linked departments
  maxStops: 4
  duration: until resolved or founder exits crisis
  orbTone: direct · calm · urgent-not-alarmist
  hqAtmosphere: focused-lighting · priority-pathways-illuminated

  suppression:
    - celebrations deferred
    - marketplace · innovation hidden unless crisis-related
    - executive moments: crisis only
```

Orb example:

> "We have two urgent issues requiring your attention. I'll take you there first."

**Nothing else matters until resolved** — or founder explicitly exits crisis mode.

---

## Celebration Mode™

```yaml
CelebrationModeMode:
  id: celebration-mode
  description: Highlight wins before routine priorities
  triggers:
    - revenue milestone
    - major launch success
    - award · achievement unlocked
    - team accomplishment signal

  openingCeremony: true              # before standard stops
  primaryStops:
    - celebration-anchors           # observatory · customer gallery · publishing
    - then trimmed morning-brief

  stopCount: 3-5 celebration + 2-3 brief
  orbTone: proud · warm · celebratory
  hqAtmosphere: vibrant · achievement-displays · subtle effects
```

Orb example:

> "Before we begin… congratulations. Yesterday became one of our strongest days yet."

---

## Innovation Day™

```yaml
InnovationDayMode:
  id: innovation-day
  description: Growth through new capabilities · marketplace · experiments
  triggers:
    - marketplace expansion available
    - new AI capability unlocked
    - experiment results ready
    - founder habit: innovation Fridays

  primaryStops:
    - marketplace
    - innovation-lab
    - research
    - experiment-sandbox
    - analytics-observatory

  stopCount: 4-6
  orbTone: curious · opportunity-forward
  hqAtmosphere: discovery · new-wing-glow
```

---

## Mode Composition

Rarely, modes **blend** with primary dominant:

| Composition | Example |
|-------------|---------|
| Celebration → Morning Brief | Win yesterday · normal priorities today |
| Launch Day + Crisis | Launch in 6h · blocker in Production |
| Creative Sprint + Innovation | New tool for creative pipeline |

Primary mode sets atmosphere. Secondary adjusts stop weights.

---

## Mode Schema

```yaml
WalkMode:
  id: string
  displayName: string
  priority: number                    # crisis > launch > celebration > ...
  pathProfile: PathProfile
  environmentProfile: DynamicHQProfile
  orbProfile: OrbAdaptationProfile
  eligibleDepartments: string[]
  narrativeTheme: string
```

---

_Next: [03 — Mode Resolution](./03_MODE_RESOLUTION.md)_
