# Resident Autonomy & Agency

## Agency verbs

`OBSERVE`, `INTERPRET`, `INITIATE`, `PROPOSE`, `COLLABORATE`, `DELEGATE`, `EXECUTE`, `ESCALATE`, `REFUSE`

## Autonomy levels

`NONE` → `FULL_WITHIN_AUTHORITY` (see `types-core.ts`)

## Founder-gated actions

`FOUNDER_GATED_ACTION_KINDS` in `life-os/constants.ts` — simulation must not execute spend, publish, hire/fire humans, legal, billing, external contracts, live infra without authority.

## Decision disposition

`DecisionDisposition` influences handle vs escalate paths; explainable weights in `PersonalityDecisionWeights` (not chain-of-thought).

## APIs

- `getResidentAutonomy`, `proposeResidentAction`, `evaluateFounderGate`, `recordResidentDecision`

## Status

**CANONIZED · SERVICE_IMPLEMENTED (gate + profiles) · RUNTIME_ACTIVE simulation loop deferred**
