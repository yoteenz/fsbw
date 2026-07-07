# User Journey Maps — Experience Studio™ 2.0

**Version:** 2.0.0  
**Parent:** [Experience v2 Package](./README.md)

---

## Master Journey — Login to First Success

```mermaid
flowchart TD
    A[Authenticate] --> B[Threshold Fade]
    B --> C{First org visit?}
    C -->|Yes| D[Orb Awakening™]
    C -->|No| E[Mission Control]
    D --> F[HQ Discovery Conversation]
    F --> G[HQ Generation Ceremony]
    G --> H[Arrival Experience™]
    H --> E
    E --> I[Creative Direction Studio]
    I --> J[Inspiration Injection]
    J --> K[Interview + DNA]
    K --> L[Project™ Created]
    L --> M[Experience Studio Canvas]
    M --> N[Production Departments]
    N --> O[Review Theater]
    O --> P[Publishing Control Room]
    P --> Q[Live + Legacy Entry]
    Q --> R[Marketplace Preview]
```

---

## State Machine — User Session

```mermaid
stateDiagram-v2
    [*] --> Threshold
    Threshold --> Onboarding: first visit
    Threshold --> Headquarters: returning
    Onboarding --> HQGeneration
    HQGeneration --> Arrival
    Arrival --> Headquarters
    Headquarters --> Traveling: select destination
    Traveling --> CreativeStudio: create
    Traveling --> Department: produce
    Traveling --> Marketplace: expand
    CreativeStudio --> ProjectActive
    ProjectActive --> Department
    Department --> ProjectActive: handoff
    ProjectActive --> Review
    Review --> Publish
    Publish --> Success
    Success --> Headquarters
    Headquarters --> [*]
```

---

## Journey 1 — First-Time Onboarding

| Step | Screen / Destination | User action | System response | Emotion |
|------|------------------------|-------------|-----------------|---------|
| 1 | Threshold | Lands post-auth | Marble fade-in | Wonder |
| 2 | Orb Awakening | Watches | Orb breathes · Director speaks | Trust |
| 3 | Discovery | Answers 6 questions | Chips · voice · skip path | Ease |
| 4 | HQ Generation | Waits 4–8s | Campus materializes | Magic |
| 5 | Arrival | Taps Enter | Wing door opens | Ownership |
| 6 | Mission Control | Orients | One hero · three destinations | Clarity |

---

## Journey 2 — Project Creation

| Step | Destination | Action | Outcome |
|------|-------------|--------|---------|
| 1 | Creative Direction Studio | "New production" | Project shell |
| 2 | Inspiration Wall | Drop Reel / images | Mood extracted |
| 3 | Interview | 5 steps or skip | DNA blend |
| 4 | Experience Studio | Canvas generates | Project 014 active |
| 5 | Campus Map | — | Creative Wing light on |

---

## Journey 3 — Department Travel

```mermaid
sequenceDiagram
    participant F as Founder
    participant C as Concierge
    participant D as Department
    participant O as Orb
    participant A as Asset

    F->>O: "Take me to Development"
    O->>D: Travel transition
    C->>F: "Your brief is ready for creative direction."
    F->>D: Work in department
    D->>A: Update Production Package
    C->>F: "Exit criteria met. Continue to Assembly?"
    F->>C: Confirm
    C->>D: Ceremonial handoff
```

---

## Journey 4 — Publish

| Step | Destination | Gate | Celebration |
|------|-------------|------|-------------|
| 1 | Review Theater | Design Health™ ≥70 | — |
| 2 | Approval Department | Founder sign-off | — |
| 3 | Publishing Control Room | 3-step pipeline | Bloom 600ms |
| 4 | Legacy Wing | Auto-entry | Plaque · no confetti |

---

## Journey 5 — Marketplace Expansion

| Step | Action | Result |
|------|--------|--------|
| 1 | Enter Marketplace Plaza | See ghost buildings |
| 2 | Preview expansion | 30s inhabitation |
| 3 | Director fit explanation | Confidence |
| 4 | Confirm install | Building materializes |
| 5 | First visit | Concierge introduces |

---

## Journey 6 — Orb Navigation

| Intent | Example utterance | Destination |
|--------|-------------------|---------------|
| Travel | "Take me to Production" | Production Department |
| Priority | "Today's priorities" | Executive Lobby focus |
| Project | "Review Project 014" | Project dashboard |
| Create | "Generate three concepts" | Creative Studio proposals |
| Queue | "Waiting for approval" | Approval Department |
| Teach | "What is Discover?" | Teach overlay · offer visit |

---

## Returning User — Compressed Path

```
Authenticate → Mission Control (no ceremony)
    ↓
Orb: "Resume Project 014?" OR Executive Lobby priorities
    ↓
One tap → last department or canvas
```

**Rule:** Ceremony is for firsts — never block returning founders.

---

## Failure & Recovery Journeys

| Failure | Experience | Recovery |
|---------|------------|----------|
| Design Health™ block | Director explains · jump to fix | Never red alarm |
| Department exit fail | Concierge lists blockers | Inline fix · retry |
| Inspiration parse fail | Warm message · manual mood board | Never error wall |
| Offline | Banner · local edit | Sync on reconnect |

---

*User Journey Maps — every transition documented before engineering.*
