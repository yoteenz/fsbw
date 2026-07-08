# Architectural Icons™ — Master Specification

**The Landmarks of Studio World™**

**Version:** 1.0.0  
**Status:** Canonical  
**Authority:** Permanent architectural law · binds all departments · all future departments

---

## Definition

**Architectural Icons™** (also **Signature Landmarks™**) are the single unforgettable architectural centerpiece of every Department™ and Headquarters™ in Studio World™.

They are not logos.  
They are not UI components.  
They are not decorative props.

They are **the place** founders remember.

---

## The Principle

| Software thinking | World thinking |
|-------------------|----------------|
| "What's the main dashboard?" | "What's the landmark?" |
| Feature hierarchy | Spatial hierarchy |
| Navigation menu | Walking toward a place |
| Brand mark | Architectural icon |
| Screen layout | Room identity |

---

## Scope

### In scope

- Every **Department™** in Studio World™
- **Headquarters™** itself (one HQ-level landmark)
- Orb™ interaction patterns per landmark
- Founder Memory™ anchoring to landmarks
- Design Law™ (five rules)
- Landmark Registry™ (canonical catalog)

### Out of scope

- Implementing landmarks in code (future sprints)
- Redesigning Creative Direction Studio™
- Replacing Scene Architecture™ navigation
- Marketplace asset production (references Landmark Registry™)

---

## Hierarchy

```
Studio World™
├── Headquarters™
│   └── HQ Signature Landmark™ (one)
│       e.g. Grand Atrium™ · Heart of Studio World™
│
└── Department™ × N
    └── Department Signature Landmark™ (one each)
        e.g. Story Table™ · Capital Vault™ · Launch Constellation™
```

**Rule:** Exactly **one** Signature Landmark™ per Department™.  
Supporting scenes · workstations · and walls exist — but orbit the landmark.

---

## Landmark vs Scene vs Hero Object

| Concept | Role | Count per department |
|---------|------|----------------------|
| **Signature Landmark™** | Department identity · memory anchor | **1** |
| **Scene™** | Workspace destination orbiting landmark | Many |
| **Hero object** | Environmental focal point within a scene | Per scene (optional) |

**Creative Direction Studio™ example:**

| Element | Classification |
|---------|----------------|
| **Story Table™** | **Signature Landmark™** — department identity |
| Living Mood Wall™ | Major scene · not the landmark |
| Creative Pipeline™ wall | Major scene · not the landmark |
| Founder Notes Desk™ | Scene · not the landmark |
| The Orb™ | Host intelligence · connects to landmark · not a landmark itself |

The Mood Wall is magnificent — but founders remember **the Story Table**.

---

## Functional Requirement

Every landmark must **do work**.

| Landmark | Function |
|----------|----------|
| Story Table™ | Creative decisions · briefs · concepts · Golden Build review |
| Living Company Genome™ | Company knowledge · relationships · predictions |
| Launch Constellation™ | Global campaign visibility · market illumination |
| Capital Vault™ | Financial health · cash flow · growth architecture |
| Talent Observatory™ | Candidate profiles · team formation |
| Fulfillment Nexus™ | Orders · logistics · inventory network |
| Charter Hall™ | Contracts · compliance · legal foundations |
| Relationship Gallery™ | Customer community · loyalty · testimonials |
| Operations Engine™ | Automation · scheduling · execution systems |

**Decoration without function violates Design Law™.**

---

## Visibility Requirement

Landmarks must be:

- **Recognizable from arrival** — partial reveal at threshold
- **Visible from multiple viewpoints** — not hidden behind one camera angle
- **Referenced in Orb speech** — *"Meet me at the Story Table"*
- **Referenced in Routines™** — routine steps name the landmark
- **Referenced in Founder Memory™** — milestones anchor to landmark

---

## Inheritance

Every new department **must** declare its Signature Landmark™ before Blueprint™ approval.

| Gate | Requirement |
|------|-------------|
| Department Generator™ input | `signatureLandmark` field required |
| Golden Department™ spec | Landmark chapter mandatory |
| Validation Loop™ | Landmark satisfies Design Law™ |
| Marketplace™ package | Landmark is non-removable framework zone |
| Living Set™ transformation | Materials change · landmark structure persists |

---

## Relationship to Living Sets™

[Living Sets™](../world/living-sets.md) transform departments per company — but **framework zones never disappear**.

The Signature Landmark™ is a **framework invariant**:

- A luxury hair brand's Creative Direction Studio™ transforms materials · lighting · props
- The **Story Table™** remains — illuminated · floating · central
- Expression changes · identity does not

---

## Relationship to Scene Architecture™

[Scene Architecture™](../navigation/README.md) defines departments as destinations.

Architectural Icons™ defines **what founders picture** when they name that destination.

```
Founder: "I need to review creative direction."
        ↓
Scene Architecture™: Navigate to Creative Direction Studio™
        ↓
Architectural Icons™: Founder pictures the Story Table™
        ↓
Arrival Sequence™: Threshold reveals Story Table silhouette
```

---

## Benchmark Question

After every landmark decision:

> *"If someone walked into this room without context — would they believe this is the world's most advanced creative operating system — and would they remember this place tomorrow?"*

If no → iterate the landmark · not the navigation.

---

## Canon Status

This specification is **permanent law** for Studio World™.

It does not expire when UI changes.  
It does not bend for convenience.  
It applies to every department — built · planned · and imagined.

---

## See Also

- [landmark-philosophy.md](./landmark-philosophy.md)
- [design-law.md](./design-law.md)
- [department-landmarks.md](./department-landmarks.md)
- [headquarters-landmarks.md](./headquarters-landmarks.md)
- [orb-landmark-system.md](./orb-landmark-system.md)
- [founder-memory.md](./founder-memory.md)
- [landmark-registry.md](./landmark-registry.md)
