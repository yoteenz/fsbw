# Orb Interaction Philosophy — Part 9

**Version:** 2.0.0  
**Parent:** [EXPERIENCE_STUDIO_2.0_SPEC.md](./EXPERIENCE_STUDIO_2.0_SPEC.md) §10  
**Inherits:** Studio Orb™ (M89.1) · Voice Mode™ (M89.2) · Conversation Engine™ (M89.3)

---

## Design Intent

Studio Orb™ is the **executive assistant** — not a chatbot corner widget.

Users speak naturally. The Orb navigates, explains, teaches, and collaborates.

---

## Orb Roles

| Role | Priority | Example |
|------|----------|---------|
| **Navigate** | 1 | "Take me to Production." |
| **Prioritize** | 2 | "Show me today's priorities." |
| **Collaborate** | 3 | "Generate three better concepts." |
| **Teach** | 4 | "What is Discover Department?" |
| **Remember** | 5 | "What did I reject last week?" |

---

## Natural Language Commands

### Navigation

| Utterance | Action |
|-----------|--------|
| "Take me to Production" | Travel → Production Department |
| "Open Creative Studio" | Travel → Creative Direction Studio |
| "Go to headquarters" | Mission Control / Executive Lobby |
| "Show Marketplace" | Marketplace Plaza |
| "Back" | Previous destination · context preserved |

### Project

| Utterance | Action |
|-----------|--------|
| "Let's review Project 014" | Project dashboard → Review if in review |
| "Resume my project" | Last active Project · last department |
| "Create a new project" | Creative Direction Studio · new flow |
| "Projects waiting for approval" | Approval Department queue |

### Creative

| Utterance | Action |
|-----------|--------|
| "Generate three better concepts" | 3 proposal cards · confidence |
| "Remix this more editorial" | Remix panel · preview |
| "Why did you suggest that?" | Expand reasoning · lenses |
| "Drop this reel as inspiration" | Inspiration wall ingest |

### Executive

| Utterance | Action |
|-----------|--------|
| "Today's priorities" | Executive Lobby · 3 items max |
| "What needs my attention?" | Blocked exit criteria · approvals |
| "Design Health on Project 014" | Score · pass/fail · fix links |

---

## Interaction Hierarchy

```
1. Studio Orb™ (always)
2. Destination focus (hero · canvas · department)
3. Ephemeral panels (dock · inspector)
4. Command palette (power users)
5. Context menu (precision)
```

*Inherited from v1.0 prototype interaction diagrams.*

---

## Orb States

| State | Visual | Trigger |
|-------|--------|---------|
| Idle | Breathe 2.4s | Default |
| Listening | Ripple | Voice · push-to-talk |
| Thinking | Amber · 1.2s | Processing |
| Opportunity | Gold ring once | Suggestion ready |
| Navigating | Brief pulse | Travel initiated |
| Dimmed | 60% opacity | Inline edit active |

---

## Radial Menu (Tap)

| Item | Action |
|------|--------|
| Ask Director | Open collaboration dock |
| Navigate | Destination picker |
| Priorities | Executive Lobby focus |
| Commands | ⌘K palette |
| Return HQ | Mission Control |

---

## Teach Mode

When user asks "What is…":

1. 30-second explanation · glass card
2. Optional "Show me" → travel to destination
3. Never blocks · dismissible

---

## Orb Boundaries

| Never | Always |
|-------|--------|
| Silent content mutation | Propose → approve |
| Modal over inline editor | Wait or dim |
| >1 unprompted suggestion / 5 min | Respect focus |
| Compete with canvas | Defer to content |
| Robotic tone | Creative Director warmth |

---

## Voice & Text Parity

Voice and text are **equal citizens** — same commands · same results · same approval model.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Keyboard | Orb focusable · Enter opens menu |
| Screen reader | State announced · not just visual |
| Reduced motion | State via color · not breathe |
| Voice off | Full text parity |

---

*Orb Interaction Philosophy — your executive team · one Orb away.*
