# 20 — Runtime QA

**Engine Module:** `studio.department-runtime.v1.qa`  
**Status:** Runtime validation gate

---

## Definition

**Runtime QA** validates that an assembled Department Workspace meets living-place standards before release to production organizations and after Marketplace installs.

Complements SDK [17 — QA Checklist](../../sdk/17_QA_CHECKLIST.md) (authoring) and Compiler [12 — QA Validation](../asset-compiler/12_QA_VALIDATION.md) (packages).

---

## The 10 Runtime Questions

| # | Question | Section |
|---|----------|---------|
| 1 | Does the department feel **alive**? | Aliveness |
| 2 | Does it feel like a **place**? | Placeness |
| 3 | Do **interactions work** physically? | Interaction |
| 4 | Does **AI collaborate** correctly? | AI |
| 5 | Does **Genome transform** the environment? | Genome |
| 6 | Does **Marketplace install** work live? | Marketplace |
| 7 | Does **performance** meet standards? | Performance |
| 8 | Does nothing feel like a **static webpage**? | Anti-Web |
| 9 | Does **Project hydration** work? | Project |
| 10 | Does **error recovery** degrade gracefully? | Recovery |

**All 10 must pass.**

---

## Section 1: Aliveness

| Check | Pass |
|-------|------|
| Ambient audio plays on ACTIVE | ✓ |
| Mood Wall breathes | ✓ |
| Particles visible (or intentional absence) | ✓ |
| Lighting responds to zone focus | ✓ |
| Orb acknowledges arrival | ✓ |
| Objects respond to hover | ✓ |
| Idle animations running | ✓ |

---

## Section 2: Placeness

| Check | Pass |
|-------|------|
| Spatial envelope bounded | ✓ |
| Entry/exit portals distinct | ✓ |
| Floor plane perceived | ✓ |
| Depth layers visible | ✓ |
| Furniture human-scale | ✓ |
| Not card grid layout | ✓ |
| Not form-first | ✓ |

---

## Section 3: Interaction

| Check | Pass |
|-------|------|
| All interaction map verbs execute | ✓ |
| Feedback: motion + audio | ✓ |
| Permission gating works | ✓ |
| Drag/pin/approve feel physical | ✓ |
| Keyboard equivalents work | ✓ |
| Reduced motion respected | ✓ |

---

## Section 4: AI Collaboration

| Check | Pass |
|-------|------|
| Multiple concierges present | ✓ |
| AI responds to verbs | ✓ |
| Collaboration visible | ✓ |
| No auto-approve | ✓ |
| Orb routes not decides | ✓ |
| Escalation paths work | ✓ |

---

## Section 5: Genome Transform

| Check | Pass |
|-------|------|
| 3+ Genome profiles visually distinct | ✓ |
| Typography adapts | ✓ |
| Lighting adapts | ✓ |
| AI voice adapts | ✓ |
| Terminology adapts | ✓ |
| Live Genome refresh works | ✓ |

---

## Section 6: Marketplace Install

| Check | Pass |
|-------|------|
| Hot install without HQ restart | ✓ |
| Genome injection on first visit | ✓ |
| World Map shows new department | ✓ |
| Commands registered | ✓ |
| Update hot-swap preserves state | ✓ |
| Rollback works | ✓ |

---

## Section 7: Performance

| Check | Pass |
|-------|------|
| Time to interactive ≤ 5s desktop | ✓ |
| FPS ≥ 30 desktop interaction | ✓ |
| Memory ≤ 150 MB | ✓ |
| BACKGROUND releases memory | ✓ |
| Mobile profile acceptable | ✓ |
| Cache effective on revisit | ✓ |

---

## Section 8: Anti-Web

| Check | Fail If |
|-------|---------|
| No full-page form layout | Form covers viewport |
| No URL-only navigation feel | No arrival sequence |
| No static screenshot env | No motion/audio |
| No tab-based dept switching | Tabs without travel |
| No data table as primary surface | Table = main work |

**Any fail = automatic rejection.**

---

## Section 9: Project Runtime

| Check | Pass |
|-------|------|
| Project hydrates objects | ✓ |
| Timeline shows milestones | ✓ |
| Approval station receives pending | ✓ |
| Output port triggers exit glow | ✓ |
| Project travel history tracked | ✓ |

---

## Section 10: Error Recovery

| Check | Pass |
|-------|------|
| Missing asset → fallback | ✓ |
| No white screen on partial fail | ✓ |
| Genome down → defaults | ✓ |
| AI fail → Orb solo | ✓ |
| Corrupt package → HQ redirect | ✓ |

---

## Validation Report

```yaml
RuntimeQAReport:
  departmentId: string
  packageVersion: string
  genomeProfilesTested: string[]
  overallResult: enum                 # passed | failed
  sections: SectionResult[]
  testedAt: datetime
  tester: string                      # automated + human
```

---

## Automated vs Human

| Automated | Human |
|-----------|-------|
| Performance metrics | "Feels alive" gut check |
| Verb execution | Spatial navigation feel |
| Genome diff screenshots | Ceremony emotional weight |
| Install pipeline | AI collaboration nuance |
| Error injection tests | Anti-web perception |

---

## Release Gate

| Result | Action |
|--------|--------|
| **Passed** | Production + Marketplace eligible |
| **Failed** | Block; return to Compiler or Runtime fix |

---

_Studio Department Runtime™ v1.0.0 — Architecture complete._
