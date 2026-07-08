# Quality Gates — Studio OS Production Lifecycle™

**Version:** 1.0.0  
**Status:** Canonical gate definitions between lifecycle stages

---

## Purpose

Quality gates are the **enforced transitions** between lifecycle stages.

Nothing advances without passing its gate. Gates produce tokens, ceremonies, or artifacts the next stage requires.

---

## Gate Map

```
Blueprint™ ──[Blueprint Complete Gate]──► Golden Build™
Golden Build™ ──[Golden Build Gate]──► Certified™ (review)
Certified™ ──[Certification Gate]──► Live™
Live™ ──[continuous]──► Evolution™
Evolution™ ──[Legacy Ceremony Gate]──► Legacy™
Legacy™ ──[Archive Placement Gate]──► Archive™ exhibit live
```

---

## Blueprint Complete Gate

**Transition:** Blueprint™ → Golden Build™

**Authority:** Founder + Department Generator schema validation

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Company Genome™ defined or inherited | `company-genome.json` or workspace binding |
| 2 | `department.json` complete | Schema pass |
| 3 | `room-dna.json` complete | Schema pass |
| 4 | `asset-manifest.json` drafted | Compiler input ready |
| 5 | Production groups defined | `production-groups.json` |
| 6 | Interaction map documented | Alpha interaction-map or equivalent |
| 7 | Founder vision captured | Sign-off · vision note |
| 8 | Zero runtime dependency | No generated assets required |

**Output artifact:** `blueprintCompleteToken`

```json
{
  "blueprintCompleteToken": {
    "departmentId": "creative-direction",
    "packageId": "pkg-creative-direction-golden-v1",
    "issuedAt": "ISO8601",
    "artifacts": ["department.json", "room-dna.json", "asset-manifest.json", "production-groups.json"]
  }
}
```

---

## Golden Build Gate

**Transition:** Golden Build™ → Certified™ (review authorized)

**Authority:** Founder walkthrough + engineering audit

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Environment Shell™ navigable | Zone walkthrough |
| 2 | Studio Orb™ operational | Greeting · guidance |
| 3 | Core interactive objects live | Mood Wall · Notes minimum |
| 4 | Generation Queue™ functional | State transitions |
| 5 | Generate Environment™ end-to-end | FAL · storage · preview |
| 6 | Reusable engine — no hardcoding | Code audit |
| 7 | 30-second comprehension (Golden Rule) | Founder test |
| 8 | `blueprintCompleteToken` consumed | Package binding verified |

**Output artifact:** `goldenBuildToken`

```json
{
  "goldenBuildToken": {
    "departmentId": "creative-direction",
    "packageId": "pkg-creative-direction-golden-v1",
    "issuedAt": "ISO8601",
    "route": "/admin/studio/department/creative-direction",
    "experiencesValidated": ["environment-shell", "studio-orb", "mood-wall", "founder-notes", "generation-queue", "generate-environment"]
  }
}
```

**Pilot status:** Creative Direction Studio™ — Golden Build Gate **passed** (Sprint 001).

---

## Certification Gate

**Transition:** Certified™ → Live™

**Authority:** Studio Validation Loop™ + Founder Review™

| # | Criterion | Evidence | Required |
|---|-----------|----------|----------|
| 1 | Studio Certified™ | Validation Loop pass | Yes |
| 2 | Walk the Room™ complete | WTR report | Yes |
| 3 | All production groups validated | Per-group reports | Yes |
| 4 | AI Braintrust™ consensus | Braintrust record | Recommended |
| 5 | Accessibility audit | WCAG report | Yes |
| 6 | Performance within SLA | Perf harness | Yes |
| 7 | Company Genome™ validation | Genome check | Yes |
| 8 | Runtime validation | Boot · recovery test | Yes |
| 9 | Founder Review™ ceremony | Founder sign-off | Yes |
| 10 | `goldenBuildToken` valid | Token check | Yes |

**Output artifact:** `certificationToken`

```json
{
  "certificationToken": {
    "entityType": "department",
    "entityId": "creative-direction",
    "packageId": "pkg-creative-direction-golden-v1",
    "issuedAt": "ISO8601",
    "certifications": ["studio-certified", "luxury-certified", "genome-certified", "experience-certified"],
    "validationApprovalToken": "validation-approval-...",
    "walkTheRoomReportId": "wtr-...",
    "founderReviewAt": "ISO8601"
  }
}
```

**Blocking rule:** Live™ deployment rejected without valid `certificationToken`.

---

## Live™ Activation Gate

**Transition:** Certified™ → Live™

**Authority:** Headquarters deployment system

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Valid `certificationToken` | Token validation |
| 2 | Headquarters slot available | Org topology |
| 3 | Analytics pipeline ready | Event sink |
| 4 | Health monitoring configured | Heartbeat |
| 5 | Launch ceremony scheduled (recommended) | Calendar · Chronicle |

**Output:** Live™ status · Chronicle launch entry · Studio Intelligence™ baseline

---

## Evolution™ (No Gate)

Live™ flows **continuously** into Evolution™. No gate — mandatory stage.

Re-certification sub-gate applies on **breaking changes**:

| Trigger | Action |
|---------|--------|
| Major asset overhaul | Re-run Validation Loop |
| Engine replacement | Re-Certified™ review |
| Genome-breaking change | Genome Certified™ re-issue |

---

## Legacy Ceremony Gate

**Transition:** Evolution™ → Legacy™

**Authority:** Founder ceremony (system may recommend)

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Significance confirmed | Founder or system recommendation |
| 2 | Successor identified (if superseded) | New package / HQ version |
| 3 | Preservation level chosen | full-immersive · snapshot · chronicle-only |
| 4 | Chronicle entry drafted | Narrative ready |
| 5 | Live™ path updated | Successor is default |

**Output artifact:** `legacyToken` + Archive™ exhibit reservation

---

## Archive Placement Gate

**Transition:** Legacy™ → Archive™ exhibit live

**Authority:** Archive™ curator (system + founder)

| # | Criterion | Evidence |
|---|-----------|----------|
| 1 | Exhibit spatial assignment | Wing · position |
| 2 | Runtime snapshot or preserved package | Read-only runtime |
| 3 | Chronicle entry published | Chronicle Hall link |
| 4 | Orb Archive™ script loaded | Reflective mode |
| 5 | Founder first-visit tested | Walkthrough |

**Output:** `archiveExhibitId` — founder can walk in

---

## Gate Violations

| Violation | System response |
|-----------|-----------------|
| Golden Build without Blueprint | Block — require Blueprint artifacts |
| Live™ without certification | Block — reject deployment |
| Legacy without Archive plan | Warn — chronicle-only minimum |
| Skip Golden Build | Block — no Certification path |

---

## Cross-References

| Gate | Document |
|------|----------|
| Blueprint | [blueprint.md](./blueprint.md) |
| Golden Build | [golden-build.md](./golden-build.md) |
| Certification | [certification-system.md](./certification-system.md) |
| Live | [live-system.md](./live-system.md) |
| Legacy | [legacy-system.md](./legacy-system.md) |
| Archive | [archive-system.md](./archive-system.md) |
