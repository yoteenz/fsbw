# AI Collaboration Guide — Studio OS™

**Version:** 1.0.0  
**Parent:** [Developer Handbook](./README.md)

---

> **Studio Intelligence™ owns the intelligence layer. AI models are replaceable reasoning engines.**

---

## AI in Studio OS

AI is not a feature bolted onto products — it is **ambient presence** through Studio Orb™, Creative Director™, and Conversation Engine™.

| Principle | Expression |
|-----------|------------|
| Intelligence as presence | Felt through environment — not trapped in sidebars |
| Human agency | Users author · AI collaborates |
| Transparency | Explain · teach · offer alternatives |
| Never silent mutation | Preview → accept/reject always |
| Conversation before configuration | Dialogue precedes forms |

---

## AI Responsibilities

### Platform (Studio Intelligence™)

| Responsibility | Owner |
|----------------|-------|
| Reasoning orchestration | Conversation Engine™ |
| Context assembly | Studio Intelligence™ layer |
| Model routing | Replaceable backends |
| Memory governance | Scoped per org/product |
| Confidence scoring | Platform service |
| Audit trail | Conversation Timeline |

### Product (e.g., Experience Studio™)

| Responsibility | AI Creative Director™ |
|----------------|----------------------|
| Layout proposals | Multidisciplinary reasoning |
| Copy suggestions | Brand-aligned |
| Design critiques | Design Health™ integration |
| SEO recommendations | Metadata |
| Accessibility guidance | WCAG awareness |
| Performance advice | Budget awareness |
| Teaching | "Why?" explanations |

### Engineering (Cursor / AI Agents)

| Responsibility | Limit |
|----------------|-------|
| Read governance first | Required |
| Map UI to `comp-*` | Required |
| Propose VDR for new patterns | Required |
| Generate module docs | Required |
| Run validators | Required |
| **Never** invent design language | Prohibited |
| **Never** mutate Foundation silently | Prohibited |
| **Never** skip Founder Approval gate | Prohibited |

---

## AI Limits

| Limit | Rationale |
|-------|-----------|
| No silent code merge to production | Human review required |
| No constitutional changes | CA process only |
| No global visual changes | VDR process only |
| No publish without human approval | Trust · liability |
| No delete without confirmation | Data safety |
| No cross-org data access | Tenant isolation |
| No unbounded memory | Privacy · cost |

---

## Approval Requirements

| Action | AI may propose | AI may execute | Human approval |
|--------|----------------|----------------|----------------|
| Layout change | ✓ | ✗ | Required |
| Inline copy edit | ✓ | ✓ | Implicit accept |
| DNA blend change | ✓ | ✗ | Required |
| Publish | ✓ | ✗ | Required |
| Delete resource | ✗ | ✗ | Human only |
| Architecture change | ✓ (doc) | ✗ | DR + human |
| New component | ✓ (VDR draft) | ✗ | VDR ratification |
| Implementation code | ✓ (PR draft) | ✗ | Human review + validators |

---

## Memory

| Scope | Content | Retention | Control |
|-------|---------|-----------|---------|
| **Turn** | Current message | Request | Automatic |
| **Session** | Project context | Session end | Clear on exit |
| **Project** | Preferences · rejections | Project lifetime | User reset |
| **Org** | Brand · tone · DNA | Persistent | HQ settings |
| **Platform** | Governance docs | Permanent | Read-only for AI |

**Rule:** AI agents read governance from docs/ — not from training data assumptions.

---

## Context

### What AI Receives

| Source | Included |
|--------|----------|
| Current screen / route | ✓ |
| Selected object | ✓ |
| Product spec | ✓ |
| Component catalog | ✓ |
| Org Design Genome™ | ✓ |
| Conversation history (session) | ✓ |
| Governance docs (on request) | ✓ |

### What AI Excludes

| Source | Excluded |
|--------|----------|
| Other orgs' data | ✗ |
| Other users' private drafts | ✗ |
| Unreleased Experimental features (Stable org) | ✗ |
| Raw credentials | ✗ |

---

## Learning

| Type | Allowed | Governance |
|------|---------|------------|
| User preference within org | ✓ | Opt-in · exportable |
| Cross-user learning | ✗ | Privacy |
| Model fine-tuning on org data | ✗ | Unless explicit contract |
| Prompt improvement from feedback | ✓ | Documented in module doc |

---

## Confidence

| Level | Threshold | UI | Action |
|-------|-----------|-----|--------|
| **High** | ≥85% | Solid proposal | One-click accept |
| **Medium** | 60–84% | "Suggested" label | Review required |
| **Low** | <60% | Question only | No mutation |

Confidence displayed on all structural proposals.

---

## Escalation

| Condition | Path |
|-----------|------|
| AI uncertain | Ask clarifying question |
| Policy violation | Block · explain |
| Repeated user rejection | Reduce proactivity |
| User says "human" | Defer · support handoff |
| Security concern | Block · log · notify |

---

## Conversation

### Flow

```
User intent (voice · text · selection · Orb)
    ↓
Context assembly
    ↓
Studio Intelligence™ reasoning
    ↓
Proposal(s) + confidence + explanation
    ↓
User: Accept · Reject · "Why?" · "Alternative?"
    ↓
Execute (if approved) → Conversation Timeline
```

### Integration Points

| System | Role |
|--------|------|
| Studio Orb™ | Entry · presence |
| Command Dock™ | Command console |
| Conversation Engine™ | Turn management |
| Voice Mode™ | Transcript merge |
| `comp-ai-chat` | Director UI |
| `comp-conversation-timeline` | History · audit |

---

## Review

### AI Output Review (Human)

| Check | Reviewer |
|-------|----------|
| Governance compliance | Engineering |
| Design catalog mapping | Design governance |
| Accessibility | A11y owner |
| Security (prompt injection) | Security |
| Quality of explanations | Product |

### AI Agent Self-Review (Cursor)

Before submitting work:

```
□ Read relevant governance docs
□ Mapped UI to comp-* catalog
□ No local design system created
□ Module doc updated if new module
□ Architecture Validator will pass
□ No Foundation mutation
□ Documented decisions
```

---

## Human Ownership

> **Humans own every published artifact. AI is a collaborator — not an author of record.**

| Artifact | Owner |
|----------|-------|
| Published experiences | Organization · named user |
| Product specifications | Product owner |
| Code merged | Engineering reviewer |
| Governance changes | Ratification authority |
| AI proposals rejected | User — no penalty |

---

## Cross-References

| Document | Path |
|----------|------|
| AI Collaboration Template | `product-starter-pack/AI_COLLABORATION_TEMPLATE.md` |
| Experience Studio AI Director | `products/experience-studio/EXPERIENCE_STUDIO_PRODUCT_SPEC.md` §11 |
| Conversation Engine™ | `conversation-engine.md` |
| Studio Orb™ | `studio-orb.md` |
| Contributor Guide | [CONTRIBUTOR_GUIDE.md](./CONTRIBUTOR_GUIDE.md) |

---

*AI Collaboration Guide — intelligence collaborates · humans decide · governance bounds both.*
