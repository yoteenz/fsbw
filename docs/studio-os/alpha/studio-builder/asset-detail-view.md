# Asset Detail View — Studio Builder™

**Sprint:** Alpha 002  
**Purpose:** Per-asset production page — producer inspecting one piece of the set

---

## Entry

Tap asset from:

- Expanded production group row
- Full queue timeline
- Validation notification deep link
- Search (future): "Mood Wall"

---

## Layout

```
← Production    LIVING MOOD WALL™
                wall-mood-cds · Hero Object

┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                    [ PREVIEW AREA ]                         │
│              current artifact or placeholder                │
│                                                             │
└─────────────────────────────────────────────────────────────┘

STATUS          ✓ Complete          Updated 2 min ago

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT STATUS
Group           Mood Wall
Resolution      Generated (new)
Provider        FAL (alpha manual)
Registry        registry:mood-wall-hero-v1 (pending)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GENERATION HISTORY
Jul 8  12:41  Approved — luxury 94 · genome 96
Jul 8  12:38  Uploaded v2
Jul 8  12:35  Validation failed — perspective
Jul 8  12:20  Uploaded v1
Jul 8  12:15  Prompt compiled v1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
VALIDATION REPORT
Luxury score        94 / 100  ✓
Genome alignment    96 / 100  ✓
Room DNA            91 / 100  ✓
Resolution          2048×2048 ✓
Perspective         Product 3/4 ✓
Immersion           Pass

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROMPT VERSION
Compiled          v1.2.0 (automatic — do not edit)
Summary           "Editorial mood wall, 5.5m floor-to-ceiling…"
[ View Summary ]  (not raw stack by default)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DEPENDENCIES
Requires          env-shell-cds ✓ · lighting-rig-cds ✓
Blocks            particles-ambient-cds · screen-compare-cds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RELATED ASSETS
screen-compare-cds · wall-brief-cds · seed-mood-cds

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CREATIVE BRANCHES
main · branch-b-explore (regen scoped to branch-b)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOUNDER NOTES
"More brass in frame edge — law firm review tomorrow"

[ Add Note ]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[ Regenerate ]    [ Retry ]    [ Approve ] (if pending)
```

---

## Preview Area

| State | Preview shows |
|-------|---------------|
| Not started | Silhouette from object-catalog + zone context |
| Prompt Ready | Compiled summary card — no image yet |
| Awaiting Upload | Drop zone overlay |
| Validating | Uploaded image + scanning animation |
| Complete | Approved artifact full bleed |
| Needs Revision | Failed upload with issue markers |
| Reused | Registry thumbnail + "From Library" badge |

Pinch zoom · before/after toggle (v1 vs v2 history).

---

## Current Status Block

| Field | Source |
|-------|--------|
| Group | Builder group map |
| Resolution | generate · reuse · adapt |
| Provider | Generation Manager route |
| Registry ID | Post-approval |
| Locked/Ready | Dependency engine |

---

## Generation History

Append-only timeline:

```yaml
HistoryEntry:
  at: ISO8601
  event: prompt-compiled | uploaded | validation-pass | validation-fail | approved | regenerated
  version: string
  actor: founder | system
  note: string | null
```

Tap entry → restore preview that version (read-only).

---

## Validation Report

Human-readable — not JSON dump.

| Dimension | Hero threshold | Default |
|-----------|----------------|---------|
| Luxury | ≥ 90 | ≥ 85 |
| Genome | pass | pass |
| Room DNA | pass | pass |
| Resolution | spec match | spec match |
| Perspective | match prompt | match |
| Immersion | pass | pass |

Failed row: red · expansion with **what to fix** in plain language:

*"Perspective reads as top-down. Expected three-quarter product angle."*

---

## Prompt Version

| Rule | Implementation |
|------|----------------|
| Founder cannot edit | Read-only |
| Version bumps on recompile | Automatic |
| Summary default | 2–3 sentence human summary |
| Raw stack | **View Technical Detail** collapsed — for support only |

Prompt version ties to `promptHash` internally.

---

## Dependencies

Visual checklist:

```
env-shell-cds        ✓ Complete
lighting-rig-cds     ✓ Complete
table-timeline-cds   ○ In progress — blocks nothing on this asset
```

Tap dependency → navigate to that asset detail.

---

## Related Assets

Same zone or ceremony chain — quick jump.

---

## Creative Branches

When founder **Regenerate** with branch:

| Branch | Behavior |
|--------|----------|
| `main` | Production line |
| `branch-b-explore` | Experimental regen · does not replace main until merge approve |

Show active branch selector on Regenerate modal.

---

## Founder Notes

Free text + voice (future). Notes feed:

- Regenerate instructions (interpreted by retry engine)
- Chronicle — not prompt injection without compile pass

---

## Actions

| Button | When enabled |
|--------|--------------|
| **Generate** | Asset unlocked · not complete |
| **Regenerate** | Complete or failed — creates new version |
| **Retry** | Needs revision — same prompt scope |
| **Approve** | Hero pending founder gate |
| **Reject** | Validation review |
| **Upload** | Alpha awaiting upload |

---

## Hero Asset Badge

`wall-mood-cds` · `env-shell-cds` · `orb-cds` show **Hero** tag — founder approval required before group complete.

---

## Empty Asset Detail

```
Mood Wall has not been generated yet.

Dependencies ready. Return to production to generate.

[ Back to Generate Mood Wall ]
```

---

_Asset detail — inspect one piece of the set like a producer, not a file._
