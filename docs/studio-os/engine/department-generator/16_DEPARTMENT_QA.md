# 16 — Department QA

**Engine Module:** `studio.department-generator.v1.qa`  
**Status:** Living-place validation gates  
**Philosophy:** Every generated department must feel like a place — not pass a checklist for a webpage.

---

## The Nine Questions

Every generated department must answer **yes** to all nine:

| # | Question | Validation Method |
|---|----------|-------------------|
| 1 | **Does it feel like a place?** | Narrative walkthrough · no UI chrome detected |
| 2 | **Does it tell a story?** | Arrival → work → ceremony → departure arc exists |
| 3 | **Is it modular?** | Every asset has unique ID · replaceable flag true |
| 4 | **Can objects be replaced independently?** | Surgical regen test per object |
| 5 | **Does Company Genome transform it?** | Two-Genome blind test |
| 6 | **Does it feel alive?** | 30s idle · continuous motion + audio |
| 7 | **Does it support runtime assembly?** | World Assembler completes · ACTIVE state |
| 8 | **Is it Marketplace-ready?** | Listing compiles · install dry-run passes |
| 9 | **Does it meet Golden Department standard?** | Inherits CDS principles (if creative pipeline) |

---

## QA Pipeline

```
Generator Compile Complete
       ↓
Static Validation (schema · dependencies · SDK compliance)
       ↓
Genome Coverage Check (all slots bound)
       ↓
Anti-SaaS Scan (forbidden patterns in prompts + metadata)
       ↓
Modularity Audit (asset graph · replaceable flags)
       ↓
Handoff Dry-Run (instruction set → Compiler mock)
       ↓
Runtime Assembly Dry-Run (manifest → Assembler mock)
       ↓
Narrative Review (Experience Narrative equivalent)
       ↓
QA Report: pass · warn · fail
```

---

## Static Validation Checklist

| Check | Source |
|-------|--------|
| Department DNA complete | 03 |
| All SDK anatomy fields | SDK 01 |
| Layout template valid | SDK 02 |
| Object classes registered | SDK 03 |
| Verbs in registry | SDK 04 |
| AI roles in registry | SDK 05 |
| Asset count ≤ budget | DNA assetBudget |
| Prompt count ≤ budget | DNA promptBudget |
| Dependency graph acyclic | Graph validator |
| No orphan assets | Zone binding required |
| Ceremonies declared | DNA ceremonies[] |
| Permissions declared | Interaction Compiler |

---

## Anti-SaaS Scan

Forbidden in prompts, metadata, and interaction labels:

| Pattern | Status |
|---------|--------|
| Card grid | Fail |
| Sidebar navigation | Fail |
| Top header bar | Fail |
| Chat bubble Orb | Fail |
| Data table furniture | Fail |
| Form field primary interaction | Fail |
| Modal dialog primary flow | Fail |
| White void environment | Fail |
| Stock photo hero | Fail |

---

## Genome Coverage Check

| Requirement | Pass |
|-------------|------|
| Every compile task has ≥1 genomeSlot | Required |
| Runtime shader slots declared | Required |
| Audio stems genome-bound | Required |
| Fallback for empty Genome fields | Required |
| Two-company transform test scheduled | Required |

---

## Modularity Audit

```yaml
ModularityAudit:
  totalAssets: number
  replaceableAssets: number       # must equal totalAssets
  flattenedAssets: number         # must be 0
  monolithicScenes: number        # must be 0
  independentRegenTested: string[]  # sample 3 assets
```

---

## Golden Department Alignment (Creative Pipeline)

Departments in creative pipeline must inherit:

| Principle | Source |
|-----------|--------|
| Room as place | Golden Department 01 |
| Physical verbs | Golden Department 08 |
| Orb on pedestal | Golden Department 09 |
| Sandbox isolation | Golden Department 03 |
| Approve ceremony | Golden Department 11 |
| Genome adaptation | Golden Department 06 |
| Anti-SaaS law | Golden Department 05 |

**Test:** *Does it feel as alive as Creative Direction Studio™?*

---

## QA Report Schema

```yaml
GeneratorQAReport:
  departmentId: string
  packageId: string
  status: enum                    # pass | warn | fail
  scoredAt: ISO8601
  nineQuestions: QuestionResult[]
  staticValidation: CheckResult[]
  warnings: string[]
  failures: string[]
  recommendedActions: string[]
  readyForCompiler: boolean
  readyForMarketplace: boolean
```

---

## Failure Recovery

| Failure Type | Action |
|--------------|--------|
| Missing zone | Re-run Environment Compiler |
| Invalid verb | Re-run Interaction Compiler |
| Genome slot gap | Re-run Genome Injection |
| Anti-SaaS hit | Re-compile affected prompts |
| Dependency cycle | Halt · manual DNA review |

Regeneration scope `qa-retry` emits fix tasks only (14).

---

_Next: [17 — Implementation Guide](./17_IMPLEMENTATION_GUIDE.md)_
