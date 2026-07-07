# User Journey Diagrams — Experience Studio™

**Version:** 1.0.0  
**Parent:** [Prototype Package](./README.md)

---

## Journey 1 — New Project (Primary Happy Path)

**Persona:** Alexandra · Executive Founder · first website

```mermaid
flowchart TD
    A[HQ Creative Wing arrival] --> B{First visit?}
    B -->|Yes| C[Welcome ceremony · Orb speaks]
    B -->|No| D[Project dashboard]
    C --> D
    D --> E[Tap Create +]
    E --> F[Experience type grid]
    F --> G[Select Website]
    G --> H[Interview · 5 steps]
    H --> I[Director summarizes DNA 70/20/10]
    I --> J[Generating canvas · 6s]
    J --> K[Workspace · canvas revealed]
    K --> L[Director explains choices]
    L --> M[Edit headline inline]
    M --> N[Open Remix · More Editorial]
    N --> O{Accept preview?}
    O -->|Yes| P[Canvas updates · undo available]
    O -->|No| Q[Revert · try another]
    P --> R[Design Health preview · 84]
    R --> S[Tap Publish]
    S --> T[Publish pipeline · checks pass]
    T --> U[Quiet celebration · live URL]
    U --> V[Return HQ · pride]
```

### Emotional Arc

| Stage | Emotion | Design lever |
|-------|---------|--------------|
| Arrival | Wonder | Marble · ceremony |
| Type select | Curiosity | 13 worlds · hints |
| Interview | Guided confidence | Director questions |
| Generate | Anticipation | Narration · progress |
| First edit | Agency | Inline · instant |
| Remix | Playfulness | Preview · safe |
| Publish | Pride | PASS score · live |
| Exit | Satisfaction | HQ transition |

---

## Journey 2 — Returning Creative Director

**Persona:** Marcus · refine existing project

```mermaid
flowchart TD
    A[Project dashboard] --> B[Open Salon Lumière draft]
    B --> C[Workspace loads · last state]
    C --> D[Version history]
    D --> E[Compare v3 vs v4]
    E --> F[Adjust Design DNA blend]
    F --> G[Canvas live update]
    G --> H[Director critiques hierarchy]
    H --> I[Accept suggestion · move CTA]
    I --> J[Design Health 92]
    J --> K[Publish update]
```

---

## Journey 3 — Director-Led Recovery

**Persona:** Any · AI timeout mid-proposal

```mermaid
flowchart TD
    A[Request layout change] --> B[Orb thinking]
    B --> C{Response?}
    C -->|Timeout 8s| D[Graceful message]
    D --> E[Continue manually · inspector open]
    E --> F[User adjusts spacing]
    F --> G[Retry Director]
    G --> H[Resume thread · timeline intact]
    H --> I[Proposal delivered]
```

---

## Journey 4 — Publish Blocked → Fixed

```mermaid
flowchart TD
    A[Tap Publish] --> B[Design Health 68 FAIL]
    B --> C[Director lists 2 blockers]
    C --> D[Jump to contrast issue]
    D --> E[Fix via inspector]
    E --> F[Re-scan · 86 PASS]
    F --> G[Publish succeeds]
```

---

## Journey 5 — Mobile Authoring

```mermaid
flowchart TD
    A[Open project on phone] --> B[Full-screen canvas]
    B --> C[Tap section]
    C --> D[Bottom sheet inspector]
    D --> E[Edit text]
    E --> F[Tap Orb]
    F --> G[Director sheet · half height]
    G --> H[Accept chip suggestion]
    H --> I[Save auto · exit]
```

---

## State Transition Table

| From state | User action | To state | Transition motion |
|------------|-------------|----------|-------------------|
| Project list | Create + | Type entry | Fade up · 320ms |
| Type entry | Select type | Interview | Panel scale-in |
| Interview | Complete | Generating | Crossfade · marble |
| Generating | Ready | Authoring | Canvas reveal · 480ms |
| Authoring | Select section | Inspector open | Dock slide · 280ms |
| Authoring | Remix chip | Preview overlay | Morph · 400ms |
| Authoring | Publish | Publish pipeline | Slide left |
| Publish | Confirm | Published | Bloom · 600ms |
| Any | Orb → HQ | Exit | Ceremonial fade |

**Detail:** [MOTION_SPECIFICATION.md](./MOTION_SPECIFICATION.md)

---

## Journey 6 — Collaboration (v1.1 Preview in Prototype)

Documented for scalability — UI shown as "Coming soon" badge on comment icon.

```mermaid
flowchart LR
    A[Authoring] --> B[Leave comment on section]
    B --> C[Notification to collaborator]
    C --> D[Reply in thread]
    D --> E[Resolve · no canvas mutation without approval]
```

---

## Cross-References

| Document | Path |
|----------|------|
| AI Flows | [AI_COLLABORATION_FLOWS.md](./AI_COLLABORATION_FLOWS.md) |
| Interactions | [INTERACTION_DIAGRAMS.md](./INTERACTION_DIAGRAMS.md) |
| Product Spec §4 | `../EXPERIENCE_STUDIO_PRODUCT_SPEC.md` |

---

*User Journey Diagrams — every path · every emotion · every transition.*
