# Permission Engine™ V1.0 (Milestone 135)

**Route:** `/admin/studio/permission-engine`

## Purpose

**Permission Engine™** is the enterprise authorization system for Studio OS.

> Permissions describe capabilities — not job titles. Organizations compose access based on what people can do. Security feels intuitive. Power is intentional. Trust is earned.

## Core philosophy

- **Capability-based** — modular permissions (Can View, Create, Edit, Approve, Publish, etc.)
- **Role composition** — reusable profiles (Founder, Executive, Marketing, Finance, …) fully customizable
- **Contextual** — adapts to organization, department, workspace, approval state, business hours, delegation, emergency mode
- **Approval chains** — employee → manager → executive → founder; every action traceable
- **Complete audit** — who granted, who removed, when, why, affected systems

## Capability examples

Can View · Create · Edit · Delete · Approve · Reject · Publish · Archive · Restore · Train Profession Brain™ · Manage Concierges · Configure Automations · Install Packs · Export Data · View Financials · Manage Users · Change Policies · Access Legacy Vault™

## Role profiles

Founder · Executive · Manager · Marketing · Finance · Operations · Customer Support · HR · Developer · Contractor · Guest

Organizations customize every role from modular capabilities.

## Contextual dimensions

Organization · Department · Project · Workspace · Feature · Approval State · Business Hours · Location (optional) · Temporary Delegation · Emergency Mode

## Architecture

| Component | Path |
|-----------|------|
| Capability catalog | `capability-catalog.ts` — modular permissions |
| Role composition | `role-composition.ts` — reusable profiles |
| Contextual engine | `contextual-engine.ts` — adaptive access rules |
| Approval chain | `approval-chain.ts` — delegated authority |
| Audit history | `audit-history.ts` — complete permission trail |
| Registration | `registration.ts` — `checkAccess()` · `canPerformCapability()` |
| Discovery | `discovery-engine.ts` — `queryPermissionEngine()` |
| Command Dock | `dock-advisor.ts` |

## Command Dock

**`resolvePermissionEngineAdvice()`** handles authorization queries:

- *"Who can publish marketing campaigns?"*
- *"Temporarily grant Finance access for two days."*
- *"Why can't this employee approve invoices?"*
- *"Show permission changes from this week."*

## Sync chain

… → Automation Registry → Prompt Registry → Policy Engine → Permission Engine → **Workspace Runtime**

**`policy-engine/store`** triggers **`syncPermissionEngineFromSources`** · **boundary-sync**

## UI

- **`PermissionEngineWorkspace`** — Overview · Capabilities · Roles · Contextual · Approval Chain · Audit · Discovery
- **`MissionControlPermissionEnginePanel`** in Legacy Wing
- Hook: **`usePermissionEngineState`**

## Storage

Demo localStorage: `studioOsPermissionEngine_v1`

## Brand voice

*"Capabilities, not titles. Power intentional. Trust earned."*

Accent: `#BE123C`

## Developer integration

When adding Studio OS features:

1. Define **capabilities** — never hardcode role checks by job title
2. Compose **roles** from capability modules
3. Call **`checkAccess()`** before sensitive actions
4. Log grants/revokes to **audit history**
5. Use **Policy Engine** for organizational rules; **Permission Engine** for who may act

## Relationship to Policy Engine™

| Layer | Scope |
|-------|-------|
| **Policy Engine™** | **What is allowed** — organizational law and rules |
| **Permission Engine™** | **Who may act** — capability-based authorization |
