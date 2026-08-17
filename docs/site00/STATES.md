# SITE 00 State Architecture

Context: `src/site00/state/Site00Context.tsx`  
Types: `src/site00/state/types.ts`

## Visitor domains

### `homeMode` (Origin homepage)

```typescript
'origin' | 'idnty-expanded' | 'bldr-expanded'
```

Homepage expansion is **state transition**, not navigation. Environment stays `ORIGIN_ENVIRONMENT`.

### Classification selections

| Field | Domain | Set on |
|-------|--------|--------|
| `selectedIdentityStateId` | IDNTY | `/idnty/state` card select |
| `selectedBuildClassId` | BLDR | `/bldr/state` card select |

Downstream assessment/routing **not implemented** — selections stored for future workflows.

### Authentication (extension point)

```typescript
authMode: 'anonymous' | 'authenticated' | 'admin'
```

Not wired to Supabase this sprint. YOUR SPACE directory rows remain disabled until auth sprint.

### Project (future)

`Site00Project` type in `config/status.ts` — fields for projectNumber, currentStage, approvedDirection, progress, etc.

## Creative direction (future)

Types in `config/status.ts`:

- `CreativeDirectionId`: A | B | C | D
- `CreativeDirectionState`: pending | presented | selected | locked | hold | hybridize | recalibrate
- `OptionDPath`: hybridize | recalibrate

Applies to IDNTY and BLUPRNT. Not implemented visually this sprint.

## Production progress (future)

```typescript
ProductionPhase: FOUNDATION | SHELL | SURFACES | SYSTEMS | INTERACTION | QA
ProductionProgress: { phase, installed, total }
```

Enables granular language like "SURFACES 08 OF 12 INSTALLED".

## Lifecycle stages

```typescript
SITE00_LIFECYCLE_STAGES = [
  'ORIGIN', 'IDNTY', 'BLDR', 'BLUPRNT', 'BUILD', 'CTRL ROOM', 'LIVE', 'EVOLVE'
]
```

## Status strip data

`SITE00_STATUS_STRIP` — **development placeholders**. Not live operational metrics.

## No global state library

Lightweight React context + reducer. Domain boundaries kept explicit for future extension.
