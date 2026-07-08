# Interaction Schema — `interactions.json`

**Schema ID:** `studio.department-generator.v1.interaction-manifest`  
**Output file:** `interactions.json`  
**Status:** Interaction Manifest specification  
**Engine source:** [06 Interaction Compiler](../engine/department-generator/06_INTERACTION_COMPILER.md)

---

## Purpose

**Interaction metadata is separate from visual assets.** Every object knows what interactions it supports — click · hover · walk · focus · inspect · talk · open · sit · expand · minimize · activate · and department-specific verbs (pin · annotate · compare · branch · approve · reject · scrub · speak).

Verbs are law, not UI events.

---

## Design Law

> The mesh does not know it is clickable. `interactions.json` declares affordances · states · permissions · ceremonies — compiled data consumed by Department Runtime and wired by Cursor.

---

## Interaction Manifest Schema

```json
{
  "$schema": "studio.department-generator.v1/interactions.json",
  "departmentId": "creative-direction",
  "version": "1.0.0",

  "primaryVerbs": ["pin", "annotate", "compare", "branch", "approve", "reject", "scrub", "speak"],
  "interactionStyle": "physical-verbs-editorial",

  "verbRegistry": {
    "pin": {
      "id": "pin",
      "displayName": "Pin",
      "triggers": ["click", "drop"],
      "description": "Attach reference to surface"
    },
    "hover": {
      "id": "hover",
      "displayName": "Hover",
      "triggers": ["hover"],
      "description": "Reveal affordance glow or tooltip"
    },
    "walk": {
      "id": "walk",
      "displayName": "Walk",
      "triggers": ["navigation"],
      "description": "Move avatar to zone via navigation graph"
    },
    "focus": {
      "id": "focus",
      "displayName": "Focus",
      "triggers": ["click", "voice"],
      "description": "Camera transitions to object inspect position"
    },
    "inspect": {
      "id": "inspect",
      "displayName": "Inspect",
      "triggers": ["click", "long-press"],
      "description": "Open detail overlay without leaving room"
    },
    "talk": {
      "id": "talk",
      "displayName": "Talk",
      "triggers": ["speak", "click"],
      "description": "Initiate concierge voice session"
    },
    "open": {
      "id": "open",
      "displayName": "Open",
      "triggers": ["click"],
      "description": "Expand panel or drawer"
    },
    "sit": {
      "id": "sit",
      "displayName": "Sit",
      "triggers": ["click"],
      "description": "Occupy seating — camera adjusts"
    },
    "expand": {
      "id": "expand",
      "displayName": "Expand",
      "triggers": ["click", "pinch"],
      "description": "Maximize surface to hero view"
    },
    "minimize": {
      "id": "minimize",
      "displayName": "Minimize",
      "triggers": ["click", "escape"],
      "description": "Return surface to ambient state"
    },
    "activate": {
      "id": "activate",
      "displayName": "Activate",
      "triggers": ["click", "ceremony"],
      "description": "Trigger workflow or ceremony sequence"
    }
  },

  "zones": [
    {
      "zoneId": "mood-wall",
      "objects": [
        {
          "assetId": "wall-mood-cds",
          "allowedVerbs": ["pin", "hover", "focus", "inspect", "compare", "annotate", "approve", "reject", "expand"],
          "states": [
            { "id": "empty", "transitions": ["pinned"] },
            { "id": "pinned", "transitions": ["clustered", "comparing"] },
            { "id": "comparing", "transitions": ["approved", "rejected"] }
          ],
          "events": [
            {
              "verb": "pin",
              "trigger": "drop",
              "behavior": "mood-wall.pin-reference",
              "audioCue": "pin-soft-click",
              "animationCue": "pin-settle",
              "stateMutation": "empty→pinned",
              "permission": null
            },
            {
              "verb": "approve",
              "trigger": "click",
              "behavior": "creative-approval.ceremony",
              "audioCue": "ceremony-approve-chime",
              "animationCue": "wall-approve-glow",
              "stateMutation": "comparing→approved",
              "permission": "founder-or-creative-director"
            }
          ]
        }
      ]
    },
    {
      "zoneId": "orb-command",
      "objects": [
        {
          "assetId": "orb-pedestal-cds",
          "allowedVerbs": ["talk", "hover", "activate", "focus"],
          "states": [{ "id": "idle", "transitions": ["listening", "routing"] }],
          "events": [
            {
              "verb": "talk",
              "trigger": "speak",
              "behavior": "orb.voice-triage",
              "audioCue": "orb-activate-hum",
              "animationCue": "orb-pulse-listen",
              "stateMutation": "idle→listening",
              "permission": null
            }
          ]
        }
      ]
    },
    {
      "zoneId": "timeline-table",
      "objects": [
        {
          "assetId": "desk-editorial-cds",
          "allowedVerbs": ["scrub", "hover", "click", "branch", "compare", "approve", "reject", "sit"],
          "states": [
            { "id": "timeline-idle", "transitions": ["scrubbing", "branching"] }
          ],
          "events": [
            {
              "verb": "scrub",
              "trigger": "drag",
              "behavior": "timeline.scrub-sequence",
              "audioCue": "scrub-tick",
              "animationCue": "timeline-track-glow",
              "stateMutation": null,
              "permission": null
            }
          ]
        }
      ]
    }
  ],

  "navigationInteractions": {
    "walk": {
      "graphRef": "environment-blueprint.json#navigationGraph",
      "arrivalCeremony": "creative-direction-arrival",
      "blockedZones": []
    }
  },

  "ceremonies": [
    {
      "id": "creative-approval",
      "triggerVerbs": ["approve"],
      "sequence": ["wall-approve-glow", "audio-ceremony-stem", "project-state-commit"],
      "permission": "founder-or-creative-director"
    },
    {
      "id": "creative-direction-arrival",
      "trigger": "navigation.entry",
      "sequence": ["camera-arrival-dolly", "ambient-audio-fade-in", "orb-greeting"],
      "durationMs": 6000
    }
  ],

  "permissionGates": [
    {
      "id": "founder-or-creative-director",
      "roles": ["founder", "creative-director-concierge"],
      "fallback": "request-approval-modal"
    }
  ],

  "gestureBindings": {
    "pinch": ["expand", "minimize"],
    "long-press": ["inspect"],
    "drag": ["scrub", "pin"],
    "drop": ["pin"]
  }
}
```

---

## Universal Verb Catalog

| Verb | Triggers | Use Case |
|------|----------|----------|
| `click` | tap · click | Primary selection |
| `hover` | pointer enter | Affordance reveal |
| `walk` | navigation | Zone traversal |
| `focus` | click · voice | Camera inspect |
| `inspect` | long-press · click | Detail without leaving room |
| `talk` | speak · click | Concierge / Orb |
| `open` | click | Panel expansion |
| `sit` | click | Seating occupation |
| `expand` | click · pinch | Hero maximization |
| `minimize` | click · escape | Return to ambient |
| `activate` | click · ceremony | Workflow trigger |

---

## Department-Specific Verbs (Editorial Style)

| Verb | Departments | Behavior Contract |
|------|-------------|-------------------|
| `pin` | creative-direction · marketing | Attach reference to surface |
| `annotate` | creative-direction · review | Add editorial note |
| `compare` | creative-direction · review | Side-by-side evaluation |
| `branch` | creative-direction · production | Fork creative path |
| `approve` | creative-direction · review · publishing | Ceremony commit |
| `reject` | creative-direction · review | Remove from consideration |
| `scrub` | creative-direction · production | Timeline sequence control |
| `speak` | All (via Orb) | Voice command |

Verbs must exist in SDK verb registry (`04_INTERACTION_ENGINE`).

---

## Interaction Style → Verb Sets

| DNA `interactionStyle` | Primary Verbs |
|------------------------|---------------|
| `editorial` | pin · annotate · compare · approve · reject |
| `command` | scrub · branch · approve · drag · click |
| `gallery` | browse · filter · inspect · preview · pin |
| `workshop` | drag · branch · preview · compare · annotate |
| `executive` | inspect · speak · approve · compare |

Resolved from `department.json` → `profiles.interaction`.

---

## Event Binding Schema

```yaml
InteractionEvent:
  verb: VerbId
  trigger: enum          # click | hover | walk | focus | inspect | talk | open | sit |
                         # expand | minimize | activate | drag | drop | hold | speak | pinch
  behavior: string       # runtime behavior contract ID
  audioCue: string | null
  animationCue: string | null
  stateMutation: string | null   # e.g. "empty→pinned"
  permission: string | null      # permission gate ID
```

---

## Relationship to Other Artifacts

| Artifact | Relationship |
|----------|--------------|
| `assets.json` | `interactiveState` maps to primary verbs per asset |
| `assets/*.blueprint.json` | `behavior.interactionBehavior` is compile-time hint |
| `department.json` | `interactions.primaryVerbs` · `ceremonies` summary |
| `assembly-blueprint.json` | Ceremony sequences bind to runtime boot |
| `handoff/runtime-assembly-manifest.json` | `behaviorContracts` + `cursorHandlers` |

Engine compiles full map to `interactions/interaction-map.json` inside Department Package per [13 Package Spec](../engine/department-generator/13_PACKAGE_SPEC.md).

---

## Anti-Patterns

| Forbidden | Canonical |
|-----------|-----------|
| onClick in mesh metadata | `events[]` in `interactions.json` |
| Modal popup for every action | Physical verb in room |
| Interactions without `behavior` contract | Every event → `behavior` ID for Runtime |
| UI button overlay as primary interaction | Object affordance + verb |
