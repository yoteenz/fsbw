# Persistent Intelligence Architecture

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Parent:** [STUDIO_AI_VISION_BIBLE.md](./STUDIO_AI_VISION_BIBLE.md)

---

## Purpose

Define how Studio AI maintains **persistent intelligence** — identity, memory, and roles — independent of any foundation model.

---

## Architectural principles

1. **Engine replaceability** — no Studio AI component may hard-depend on a single vendor API shape  
2. **Memory sovereignty** — institutional memory lives in IME + protocol, not in model weights  
3. **Role stability** — executive roles are first-class entities, not prompt personas  
4. **Persona ownership** — Studio AI owns voice; adapters translate, not redefine  
5. **Succession by design** — every layer must support export/import without loss  
6. **Single identity** — one Studio AI version string; engines are subordinate  

---

## System map

```
┌──────────────────────────────────────────────────────────────────┐
│                         STUDIO AI RUNTIME                         │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Role Registry  │  │ Persona Engine │  │ Session Director │  │
│  │ (executive     │  │ (voice, style, │  │ (orchestrates    │  │
│  │  roles)        │  │  teaching)     │  │  turns + tools)  │  │
│  └───────┬────────┘  └───────┬────────┘  └────────┬─────────┘  │
│          │                   │                     │             │
│          └───────────────────┼─────────────────────┘             │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Memory Orchestrator                          │  │
│  │  Load · Diff · Verify · Write-back to IME                 │  │
│  └───────────────────────────┬──────────────────────────────┘  │
│                              ▼                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │         Reasoning Engine Adapter (REA)                    │  │
│  │  complete · stream · tools · vision · embed               │  │
│  └───────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────┘
                               ▼
                    Foundation Model Provider(s)
```

---

## Layer responsibilities

| Layer | Owns | Must not own |
|-------|------|--------------|
| **Foundation Model** | Token generation, native capabilities | Project memory, canon, roles |
| **Reasoning Engine Adapter** | API translation, capability flags | Persona definition |
| **Studio AI Intelligence Layer** | Identity, roles, persona, orchestration | Raw model weights |
| **Institutional Memory Engine** | Capsules, graph, decisions, timeline | UI rendering |
| **Founder / Project DNA** | Collaboration + civilization traits | Engine selection |
| **Knowledge Graph** | Living relationships | Chat history |
| **Context Protocol** | Portable transfer format | Runtime execution |
| **Studio OS** | Product surfaces, Genesis Orb, districts | External LLM brands |

---

## Core subsystems

### 1. Role Registry

Persistent registry of AI employee roles. Each role has:

- `roleId`, `title`, `mandate`, `memoryScope`, `personaOverlay`, `defaultEnginePreference`  
- Active assignment: which role is speaking in this session  
- Succession invariant: role survives engine swap  

Spec: [EXECUTIVE_ROLE_MODEL.md](./EXECUTIVE_ROLE_MODEL.md)

### 2. Persona Engine

Applies Studio AI voice on top of engine output:

- Post-process or system-layer injection (never rely on model default alone)  
- Teaching style, executive presence, humor bounds  
- Founder DNA alignment checks  

Spec: [PERSONA_CONTINUITY_SYSTEM.md](./PERSONA_CONTINUITY_SYSTEM.md)

### 3. Session Director

Orchestrates a collaboration session:

- Selects role  
- Loads memory slice (full capsule vs diff vs handoff-only)  
- Invokes REA with structured context  
- Emits AI Passport + onboarding report hooks  
- Queues memory write-back (decisions, not raw chat)  

### 4. Memory Orchestrator

Bridge between Studio AI runtime and IME:

- **Read:** bootstrap → health → DNA → graph → handoff  
- **Write:** decision entries, timeline events, role session logs (structured)  
- **Diff:** incremental catch-up on session start  
- **Verify:** post-succession knowledge checks  

Spec: [INSTITUTIONAL_MEMORY_ARCHITECTURE.md](./INSTITUTIONAL_MEMORY_ARCHITECTURE.md)

### 5. Reasoning Engine Adapter

Vendor-neutral interface to foundation models.

Spec: [REASONING_ENGINE_ABSTRACTION_LAYER.md](./REASONING_ENGINE_ABSTRACTION_LAYER.md)

---

## Data flow — normal session

```
1. Founder opens Studio AI (role: Creative Director)
2. Session Director loads Studio AI version + active engine
3. Memory Orchestrator applies knowledge-diff since last session
4. Persona Engine loads voice profile + Founder DNA constraints
5. REA receives: system (Studio AI + role + canon) + memory context + user turn
6. Foundation model generates
7. Persona Engine validates output against DNA + canon
8. Response delivered; structured decisions queued for IME
9. AI Passport updated with contextVersion
```

---

## Data flow — engine succession

```
1. Founder: "Upgrade Studio AI"
2. Succession Controller exports memory bundle (see AI_SUCCESSION_SYSTEM)
3. New engine registered in REA
4. Model Compatibility Layer runs validation suite
5. Memory Orchestrator imports + verifies
6. Founder compatibility confirmation (onboarding report comparison)
7. Promote engine; archive previous in Engine Vault
8. Studio AI version increments (patch/minor per roadmap)
9. Roles and persona unchanged — session continues
```

Spec: [AI_SUCCESSION_SYSTEM.md](./AI_SUCCESSION_SYSTEM.md) · [UPGRADE_WORKFLOW.md](./UPGRADE_WORKFLOW.md)

---

## Persistence stores (future)

| Store | Contents | Authority |
|-------|----------|-----------|
| **Studio AI Registry** | Version, active engine, role assignments | Platform |
| **Engine Vault** | Archived adapters + promotion history | Succession |
| **IME Archive** | Capsules, passports, graph, decisions | Institutional |
| **Persona Profile** | Voice, style, teaching parameters | Studio AI |
| **Role Registry** | Executive role definitions | Studio AI |

No chat log store as primary asset — structured memory only.

---

## Integration points (Studio OS)

| Surface | Integration |
|---------|-------------|
| **Genesis Orb** | Subscribes to Session Director state (thinking, speaking, compiling) |
| **Studio Archive** | Export/import capsules; succession bundle source |
| **Studio Institute** | Professor roles (Atlas, Motion, Signal, Palette) |
| **Experience Lab** | Professor Motion + compile-aware context |
| **Headquarters** | Creative Director default entry |
| **motherboard/** | Cursor path — agent memory until native convergence |

---

## Failure modes

| Failure | Response |
|---------|----------|
| Engine API down | Failover to secondary engine in compatibility matrix |
| Memory import incomplete | Block promotion; degraded mode with founder ack |
| Persona drift detected | Collaboration verification fails; hold succession |
| Canon violation in output | Persona Engine reject + retry with canon injection |
| Version mismatch | Knowledge diff + bootstrap warnings |

---

## Code location (future — not this sprint)

```
src/studio-os-core/studio-ai/
├── registry/           # Studio AI version, roles
├── persona/            # Persona engine
├── session/            # Session director
├── memory/             # Memory orchestrator → IME client
├── reasoning/          # REA implementations
├── succession/         # Upgrade workflow controller
└── compatibility/      # Validation suites
```

---

*Architecture specification only — no implementation in this sprint*
