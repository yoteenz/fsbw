# Validation Workflow — Studio Builder™

**Sprint:** Alpha 002  
**Gate:** No asset reaches ✓ Complete without validation pass

---

## Flow Overview

```
Artifact received (upload or API)
         ↓
Automated pre-check (instant)
         ↓
Full validation (genome · luxury · room DNA · spec)
         ↓
├── Hero asset? → Founder approval gate
└── Standard? → Auto-approve if scores pass
         ↓
✓ Complete → Registry write → Unlock dependents
```

---

## Validation Surfaces

| Surface | When |
|---------|------|
| Inline on group row | Summary pass/fail |
| Upload modal | Immediate pre-check |
| Asset detail | Full report |
| Founder modal | Hero approval |

---

## Automated Checks

| Check | Fail message (founder) |
|-------|------------------------|
| File format | "Please upload PNG, WebP, or GLB." |
| Resolution below spec | "Image resolution too low for this asset." |
| Corrupt file | "File could not be read. Try exporting again." |
| Wrong aspect | "Aspect ratio doesn't match Mood Wall spec." |
| Empty upload | "No file selected." |

Pre-check before expensive validation.

---

## Quality Checks

From production [asset-review-system.md](../../production/asset-review-system.md):

| Dimension | Method (Alpha) | Threshold |
|-----------|----------------|-----------|
| Luxury quality | Visual model + heuristic | 85 · hero 90 |
| Company Genome | Slot + thingsWeNeverDo scan | pass/fail |
| Room DNA | Slider alignment | pass/fail |
| Perspective | Prompt camera spec match | pass/fail |
| Material | PBR / genome slot presence | pass/fail |
| Lighting consistency | Rig compatibility | warn/pass |
| Readability | Interactive surface legibility | pass (UI assets) |
| Immersion | Anti-SaaS heuristic | pass/fail |
| Performance | File size budget | warn |

Alpha may use **founder-assisted** validation for hero — automated + human confirm.

---

## Validation States in UI

```
Reviewing Quality…     (spinner — 3–15s)
Needs Revision         (report expanded)
Awaiting Your Review   (hero only)
✓ Complete             (green lock)
```

---

## Founder Approval Gate (Hero)

Assets: `wall-mood-cds` · `env-shell-cds` · `orb-cds` (reuse confirm)

```
MOOD WALL — Ready for Your Review

[ Preview large ]

Luxury 94 · Genome 96 · Room DNA 91

Does this feel like the creative heart of your company?

[ Approve ]    [ Request Revision ]
```

**Request Revision** → notes field → retry engine scope.

---

## Reject vs Needs Revision

| Outcome | Next step |
|---------|-----------|
| **Needs Revision** (auto) | Retry with surgical scope |
| **Founder Reject** | Same + founder notes priority |
| **Approve** | Registry · unlock |

---

## Validation Report Persistence

Stored per asset version:

```yaml
ValidationReport:
  assetId: string
  version: string
  scores: object
  failures: []
  approvedAt: ISO8601 | null
  approvedBy: founder | auto
```

Visible in asset detail history.

---

## Group Completion Rule

Group → ✓ Complete when:

- All required assets in group **approved**
- Hero assets have **founder sign-off**
- Reuse items **confirmed**

Partial: group stays **In Progress**.

---

## Unlock Trigger

On asset approval:

```
evaluateUnlockRules()
notifyFounder(unlockedGroups[])
updateQueueUI()
```

Synchronous UX — unlock visible within 1s of approve tap.

---

## Batch Validation

Architecture 6 assets — founder may upload sequentially:

- Each validates independently
- Group completes when 6/6 approved
- Queue shows `Architecture 4/6` until done

---

## Failed Validation UX

```
⚠ CEILING — Needs Revision

Perspective reads as flat elevation. Expected coffered interior view.

Suggested: Retry with camera adjustment (automatic)

[ Retry ]    [ View Report ]
```

No blame language — studio tone.

---

## Registry Block

Until validation pass:

```
Registry status: Pending validation
```

Founder cannot force Registry write. No advanced override in Alpha.

---

_Validation workflow — quality gate before the library remembers._
