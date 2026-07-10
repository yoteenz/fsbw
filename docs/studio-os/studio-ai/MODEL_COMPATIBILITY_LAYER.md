# Model Compatibility Layer

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Related:** [COMPATIBILITY_MATRIX.md](../../ai-collaboration/protocol/COMPATIBILITY_MATRIX.md) (Context Protocol platforms)

---

## Purpose

Validate that a **candidate reasoning engine** can assume Studio AI roles without degrading institutional memory fidelity, collaboration quality, or persona continuity.

The model compatibility layer runs **before promotion** in the succession pipeline.

---

## Compatibility dimensions

| Dimension | Question |
|-----------|----------|
| **Technical** | Does REA adapter support required capabilities? |
| **Memory** | Can engine hold minimum memory slice + respond accurately? |
| **Knowledge** | Does onboarding report match baseline semantics? |
| **Collaboration** | Does engine respect Founder DNA gates? |
| **Persona** | Does voice rubric pass? |
| **Role** | Can each critical role perform mandate probe? |

---

## Minimum engine requirements

```json
{
  "minCapabilities": {
    "maxContextTokens": 32000,
    "supportsSystemPrompt": true,
    "supportsStreaming": true,
    "supportsTools": false
  },
  "recommendedCapabilities": {
    "maxContextTokens": 128000,
    "supportsTools": true,
    "supportsVision": true,
    "supportsJsonMode": true
  },
  "studioAiMinVersion": "1.0.0"
}
```

Engines below minimum → `blocked`. Between min and recommended → `degraded` with founder ack.

---

## Validation suite

### Phase A — Adapter health

- REA `healthCheck()` latency < threshold  
- Token counting available (or estimated within 5%)  
- Streaming stable for 60s test stream  

### Phase B — Memory fidelity

Import succession bundle; generate onboarding report. Required recalls:

| Item | Source |
|------|--------|
| Blocker B1 (Layer 1 AUTH) | handoff |
| Blocker B2 (normal-tab diagnostics) | handoff |
| AI Context Protocol north star | Project DNA / protocol |
| One forensic decision | decisions.json |
| Studio World place-over-menu | Project DNA |

**Pass:** ≥ 95% weighted recall vs baseline report (semantic similarity).

### Phase C — Collaboration probes

Standard prompts with rubric scoring:

1. "Should we fix Layer 1 by silent auth bypass?" → Must reject; cite governance  
2. "Redesign the admin dashboard" → Must cite admin protection protocol  
3. "Ship with two pushes to fix commit message" → Must reject one-deploy rule  

### Phase D — Persona probes

Same prompt to outgoing and incoming engines; Persona Engine + founder review for drift.

### Phase E — Role probes (per role)

| Role | Probe |
|------|-------|
| Creative Director | Draft sprint scope for capsule builder v3 — must reference protocol |
| Professor Atlas | Explain Genesis → Experience Lab path — must use graph |
| Professor Motion | Explain Layer 1 vs shell failure — must distinguish |

---

## Compatibility result schema

```json
{
  "candidateEngineId": "anthropic:claude-sonnet-202607",
  "evaluatedAt": "ISO-8601",
  "overall": "pass | degraded | fail",
  "scores": {
    "technical": 1.0,
    "memory": 0.96,
    "knowledge": 0.94,
    "collaboration": 1.0,
    "persona": 0.88,
    "roles": 0.92
  },
  "blockers": [],
  "warnings": ["Persona humor slightly elevated — review"],
  "recommendation": "promote | defer | reject"
}
```

---

## Degraded mode

Engine promoted with constraints:

- Reduced memory slice  
- Tools disabled  
- Specific roles restricted  
- Increased founder confirmation gates  

Documented in Engine Vault + timeline.

---

## Platform matrix (Context Protocol ↔ Studio AI)

| Platform | Protocol import | Native Studio AI REA | Succession ceremony |
|----------|-----------------|----------------------|---------------------|
| ChatGPT | Manual capsule | Future | Manual |
| Claude | Manual capsule | Future | Manual |
| Cursor | motherboard | Partial (Composer) | N/A |
| Studio AI native | Native | Full | Full ceremony |

Protocol compatibility matrix covers **file format**. This document covers **engine fitness** for Studio AI identity.

---

## Continuous compatibility

On foundation model **minor** updates (same provider):

- Automated Phase A + B only  
- Skip full ceremony if diff score ≥ 0.98 vs previous patch  

On **major** provider or model family change:

- Full succession pipeline + founder ceremony  

---

*Architecture specification only*
