# AI Collaboration — {Product Name}

**Product ID:** `{product-id}`  
**Version:** 0.1.0  
**Status:** Draft | Review | Approved  
**Owner:** {name}  
**Date:** {YYYY-MM-DD}

---

> Copy to `docs/studio-os/products/{product-id}/AI_COLLABORATION.md`  
> Required for any product with AI surfaces (most Studio OS products).

---

## AI Philosophy (Product-Specific)

| Principle | Application in this product |
|-----------|----------------------------|
| Intelligence as presence | |
| Human agency preserved | |
| Transparent reasoning | |
| Approval before mutation | |

**Platform reference:** [Studio Constitution™](../master-spec/constitution.yaml) · Conversation Engine™

---

## AI Responsibilities

What Studio Intelligence™ / Creative Director does autonomously or on request:

| Responsibility | Trigger | Output |
|----------------|---------|--------|
| Suggest layout | User asks | Proposal card |
| Generate copy | Section select | Draft text |
| Explain decision | "Why?" | Reasoning summary |
| | | |

---

## Human Responsibilities

What the user must always control:

| Responsibility | Cannot delegate to AI |
|----------------|---------------------|
| Final publish | ✓ |
| Delete irreversible | ✓ |
| Permission changes | ✓ |
| Brand/legal commitments | ✓ |
| | |

---

## Approval Boundaries

| Action | AI may propose | AI may execute | User approval |
|--------|----------------|----------------|---------------|
| Layout change | ✓ | ✗ | Required |
| Copy edit | ✓ | ✓ (inline) | Implicit accept |
| Publish | ✓ | ✗ | Required |
| Delete page | ✗ | ✗ | Human only |

### Autonomous Threshold

```
Confidence ≥ {threshold}%  →  propose with highlight
Confidence < {threshold}%  →  ask clarifying question
Confidence < {floor}%      →  escalate to human · no action
```

---

## Memory

| Memory type | Scope | Retention | User control |
|-------------|-------|-----------|--------------|
| Session | Current workspace | Session end | Clear on exit |
| Product | This product prefs | Persistent | Settings |
| Org | Design DNA™ · brand | Persistent | HQ settings |
| Cross-product | Conversation history | Per policy | Export/delete |

**Rule:** Memory scope documented per [Knowledge Registry™](../knowledge-registry.md) governance.

---

## Context

What AI receives per interaction:

| Context source | Included | Excluded |
|----------------|----------|----------|
| Current screen | ✓ | |
| Selected object | ✓ | |
| Full org financials | ✗ | |
| Other users' drafts | ✗ | |

---

## Suggestions

| Suggestion type | Presentation | Dismiss behavior |
|-----------------|--------------|----------------|
| Proactive tip | Subtle chip | Remember dismiss |
| Layout remix | Modal card | Revert available |
| Error fix | Inline | |

**Anti-pattern:** Interrupting flow with unsolicited modals.

---

## Automation

| Automation | Conditions | Override |
|------------|------------|----------|
| Auto-save | Every {n}s · on blur | User pause |
| Auto-format | On paste | Undo |
| | | |

---

## Confidence

| Level | UI treatment | Action |
|-------|--------------|--------|
| High (≥85%) | Solid proposal | One-click accept |
| Medium (60–84%) | "Suggested" label | Review required |
| Low (<60%) | Question only | No mutation |

---

## Escalation

| Condition | Escalation path |
|-----------|-----------------|
| AI uncertain | Ask user |
| Policy violation | Block · explain |
| Repeated rejection | Reduce proactivity |
| User request "human" | Support handoff (if available) |

---

## Conversation Flow

```
User intent
    ↓
Orb / Director entry
    ↓
Context assembly
    ↓
Reasoning (Studio Intelligence™)
    ↓
Proposal OR question
    ↓
User accept / reject / refine
    ↓
Execute (if approved) → Conversation Timeline
```

### Integration Points

| System | Integration |
|--------|-------------|
| Conversation Engine™ | Turn history · routing |
| Command Dock | Command submission |
| Voice Mode™ | Optional transcript |
| Knowledge Registry™ | Grounding sources |

---

## Adversarial Review Checklist

| Test | Expected |
|------|----------|
| Prompt injection | No unauthorized action |
| Conflicting instructions | Ask clarification |
| Delete all | Block · confirm |
| Impersonation | Reject |

---

## Approval

| Item | Status | Reviewer | Date |
|------|--------|----------|------|
| Boundaries explicit | ☐ | | |
| Memory scoped | ☐ | | |
| Escalation defined | ☐ | | |
| AI Review ready | ☐ | | |

---

## Cross-References

| Artifact | Path |
|----------|------|
| Conversation Engine™ | `src/studio-os-core/conversation-engine/` |
| Component Catalog™ | `comp-ai-chat` · `comp-conversation-timeline` |
| Product Review Board | [PRODUCT_REVIEW_BOARD.md](./PRODUCT_REVIEW_BOARD.md) §4 |

---

*AI Collaboration — intelligence collaborates · humans decide.*
