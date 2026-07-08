# Founder Experience — Studio Builder™

**Sprint:** Alpha 002  
**Audience:** Founders · creative directors · executive producers

---

## Emotional Contract

The founder is a **film producer** overseeing a world-class creative build — not an operator managing DevOps, files, or prompt engineering.

| Feel | Never Feel |
|------|------------|
| "Production is underway" | "I need to find the right markdown file" |
| "My studio knows what to do" | "Which prompt goes first?" |
| "I approve quality" | "I assemble prompts manually" |
| "Departments unlock as work completes" | "I track spreadsheets" |

---

## Entry Point

Founder does **not** land in `/docs`. Founder lands in:

```
Studio Builder
└── Creative Direction Studio™
    └── Project 001
```

Optional paths (same shell):

- From Headquarters → **Build Department** → Creative Direction Studio
- From Mission Control → **Production** strip → active department
- From department portal (future) → **Production View** toggle

Never: "Read the alpha blueprint first."

---

## Department Production Home

```
╔══════════════════════════════════════════════════════════════╗
║  CREATIVE DIRECTION STUDIO™                    Project 001   ║
╠══════════════════════════════════════════════════════════════╣
║  Status          Blueprint Complete                          ║
║  Assets          0 / 35 Generated  ·  16 Groups              ║
║  Overall         ░░░░░░░░░░░░░░░░░░  0%                       ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  ENVIRONMENT                                                 ║
║  Not Started                                                 ║
║                                                              ║
║              [ Generate Environment ]                        ║
║                                                              ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  ARCHITECTURE                              🔒 Locked         ║
║  Waiting on Environment                                      ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  LIGHTING                                  🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  FURNITURE                                 🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  GLASS SYSTEMS                             🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  MOOD WALL                                 🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  ORB                                       🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  TIMELINE                                  🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  PANELS                                    🔒 Locked         ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║  … (scroll: Particles · Audio · Animations · Runtime Meta)   ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

**One primary action** per unlocked group: **Generate**.

No prompt textarea. No file picker for specs. No dependency diagram to interpret.

---

## After First Generate Completes

```
ENVIRONMENT                              ✓ Complete
ARCHITECTURE                             Ready
              [ Generate Architecture ]
LIGHTING                                 🔒 Locked
FURNITURE                                🔒 Locked
…
```

Unlock is **automatic** — founder sees it, does not configure it.

---

## Visual Language (Not SaaS)

| Use | Avoid |
|-----|-------|
| Production strip lighting on active group | Card grid |
| Film slate group headers | Accordion settings panels |
| Stage status: Not Started · Generating · Validating · Complete | Enum dropdowns |
| Progress bar as set construction | Bootstrap progress only |
| Locked = dimmed strip + plain reason | Disabled tooltip jargon |
| Hero groups (Mood Wall) subtle gold edge | Star badges everywhere |

Background: subtle workshop atmosphere — blurred department preview or marble production floor texture. Not white admin chrome.

---

## Founder Actions (Allowed)

| Action | When |
|--------|------|
| **Generate** | Group unlocked |
| **Copy Prompt** | Alpha only — after Prompt Ready |
| **Open Generator** | Alpha only — deep link FAL |
| **Upload Result** | Alpha only — after external gen |
| **Approve / Reject** | After validation · hero assets |
| **Retry** | Failed validation |
| **Regenerate** | Asset detail view |
| **Pause / Resume** | Queue running (future automation) |
| **View Asset Detail** | Tap any group or asset |
| **Founder Notes** | Asset detail — never raw prompt edit |

---

## Founder Actions (Forbidden)

| Forbidden | Why |
|-----------|-----|
| Edit compiled prompt manually | Prompt Compiler owns quality |
| Reorder queue manually | Dependency engine owns order |
| Browse `docs/studio-os/` | Internal knowledge only |
| Pick provider per asset | Generation Manager routes |
| Skip validation | Registry block |
| Combine markdown fragments | Automatic ingestion |

---

## Status Vocabulary

Founder-facing labels only:

| Internal state | Founder sees |
|----------------|--------------|
| `queued` | Queued |
| `preparing` | Preparing… |
| `prompt-compiled` | Prompt Ready |
| `generating` | Generating… |
| `validating` | Reviewing Quality… |
| `approved` | ✓ Complete |
| `needs-revision` | Needs Revision |
| `locked` | Locked — {reason} |
| `reused` | ✓ Reused from Library |

Never expose: `registry:glass-panel-frosted-v2@3.1.0` in headline — detail view only.

---

## Notification Tone

Orb or slim production banner — not toast spam:

- *"Environment prompt ready."*
- *"Environment approved. Architecture and Lighting are now available."*
- *"Mood Wall needs your review."*

Max one banner at a time. Respects Founder Cognitive Load™.

---

## Relationship to Immersive Department

Studio Builder is **production mode**. The built department is **experience mode**.

```
Studio Builder (build)  →  Walk the Room / Enter Department (experience)
```

Toggle: **Production** | **Preview Room** (graybox → art pass → live)

Founder builds in Builder, walks in Runtime when ready.

---

## Multi-Department (Future Shell)

Same experience for every department:

```
Studio Builder
├── Creative Direction Studio™  ← Alpha pilot
├── Discover Department™
├── Story Department™
└── …
```

Only group names and asset counts change — shell identical.

---

## Golden Rule Test

> Founder describes their job as *"I pressed Generate and watched my creative headquarters get built"* — never *"I dug through docs and pasted prompts."*

---

_Founder experience — producer overlooking the lot, not operator in the repo._
