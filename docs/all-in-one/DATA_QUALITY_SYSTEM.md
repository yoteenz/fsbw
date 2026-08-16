# Data Quality System (Management)

## Registry

`DATA_QUALITY_RULES` in `managementDataQuality.ts`

Each rule: id, name, severity, description, entity, resolution guidance.

## Detection (deterministic)

- Payment missing allocation
- Invoice missing fee classification
- Orphaned service request
- Workflow without owner
- Conversation without context
- Duplicate lead candidate

## Route

`/debug/all-in-one/office/management/data-quality`

## Resolution

Management opens affected canonical record. No silent auto-repair of high-impact financial records.

## Integration

Financial dashboard shows **Incomplete data** when allocation gaps exist (`hasIncompleteAllocation`).
