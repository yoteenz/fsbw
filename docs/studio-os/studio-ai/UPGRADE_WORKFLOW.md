# Upgrade Workflow

**Version:** 1.0.0  
**Status:** Architecture specification — no implementation  
**Trigger:** Founder command **"Upgrade Studio AI"** or platform-initiated engine availability

---

## Purpose

Step-by-step workflow from upgrade intent to seamless continuation — the operational companion to [AI_SUCCESSION_SYSTEM.md](./AI_SUCCESSION_SYSTEM.md).

---

## Actors

| Actor | Responsibility |
|-------|----------------|
| **Founder** | Initiate, approve, abort |
| **Succession Controller** | Orchestrates pipeline (future service) |
| **IME** | Export/import memory bundle |
| **REA** | Register candidate, route inference |
| **Compatibility Layer** | Run validation suite |
| **Persona Engine** | Verify voice continuity |
| **Engine Vault** | Archive outgoing engine |

---

## Workflow states

```
IDLE → PREPARING → EXPORTING → REGISTERING → IMPORTING →
VALIDATING → VERIFYING → AWAITING_FOUNDER → PROMOTING →
ARCHIVING → COMPLETE | FAILED | ROLLED_BACK
```

Idempotent: resume from last safe state on interruption.

---

## Step-by-step

### Step 1 — Initiate (IDLE → PREPARING)

**Founder:** "Upgrade Studio AI" or selects new engine in HQ.

System checks:

- No active compile-critical session (optional soft gate)  
- Outgoing engine healthy  
- Candidate engine registered in catalog  

Output: `SuccessionJob` with unique `jobId`.

---

### Step 2 — Export (PREPARING → EXPORTING)

IME builds:

- Full `.studiocapsule` at current `contextVersion`  
- `Succession/manifest.json` with job metadata  
- Role Registry + Persona Profile snapshots  

Founder sees: *"Preparing institutional memory export…"*

---

### Step 3 — Register candidate (EXPORTING → REGISTERING)

REA loads new adapter as `status: candidate`.

Health check Phase A.

Founder sees: *"Validating new reasoning engine…"*

---

### Step 4 — Import (REGISTERING → IMPORTING)

Memory Orchestrator loads bundle into **isolated candidate context** — outgoing engine still serves live session if needed.

Founder sees: *"Transferring institutional memory…"*

---

### Step 5 — Validate (IMPORTING → VALIDATING)

Model Compatibility Layer runs full suite.

Founder sees: *"Running compatibility validation…"* + progress scores.

**Fail:** → FAILED state; outgoing remains active; report delivered.

---

### Step 6 — Verify (VALIDATING → VERIFYING)

- Knowledge verification (onboarding reports)  
- Collaboration verification (probes)  
- Persona verification (rubric)  
- Graph sync check (relationship integrity)  
- Context Protocol checksum verification  

Founder sees: *"Verifying knowledge graph and context protocol…"*

---

### Step 7 — Founder approval (VERIFYING → AWAITING_FOUNDER)

Present:

- Side-by-side onboarding report summary  
- Compatibility scores  
- Sample Creative Director response comparison  
- Warnings / degraded mode notice  

Actions: **Approve** · **Defer** · **Abort**

No auto-promote.

---

### Step 8 — Promote (AWAITING_FOUNDER → PROMOTING)

- Candidate → `active`  
- Outgoing → `archiving`  
- Studio AI version bump (semver rules below)  
- Timeline + decision memory write  
- AI Passport succession lineage  

Founder sees: *"Studio AI 1.2.0 is now active."*

---

### Step 9 — Archive (PROMOTING → ARCHIVING)

Outgoing engine → Engine Vault (read-only).

Retention policy: minimum 12 months or until next major succession.

Founder sees: *"Previous engine archived securely."*

---

### Step 10 — Complete (ARCHIVING → COMPLETE)

Session continues with same role assignment.

Optional: Genesis Orb brief "continuity" animation (future).

Founder sees: *"Upgrade complete. Creative Director continues."*

---

## Version bump rules

| Change type | Studio AI version |
|-------------|-------------------|
| Patch engine (same family) | `1.0.x` |
| New engine family, full ceremony | `1.x.0` |
| Persona profile change (founder approved) | minor bump |
| Role registry breaking change | major bump |

**Studio AI version** is what founders ask about — not `gpt-4o`.

---

## Abort and rollback

| Action | When | Result |
|--------|------|--------|
| **Abort** | Before promote | Outgoing active; no version bump |
| **Rollback** | Within 72h post-promote | Restore outgoing from Vault |
| **Failed validate** | Auto | Abort with report |

---

## HQ UI path (future)

```
Studio Headquarters
  └── Studio Archive
        └── Studio AI
              ├── Current version & active engine (hidden detail in advanced)
              ├── Upgrade Studio AI
              ├── Succession history
              └── Engine Vault (read-only audit)
```

---

## CLI path (interim)

```bash
# Future — not implemented
npm run studio-ai:succession -- --candidate anthropic:claude-sonnet-202607 --dry-run
npm run studio-ai:succession -- --candidate anthropic:claude-sonnet-202607 --approve
```

Dry-run executes through VERIFYING without PROMOTING.

---

## Notifications

| Event | Channel |
|-------|---------|
| Validation fail | HQ banner + email optional |
| Awaiting founder | Push / HQ modal |
| Complete | Timeline entry + changelog |

---

*Architecture specification only*
