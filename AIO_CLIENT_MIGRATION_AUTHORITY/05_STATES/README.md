# Material states

Separate EMPTY / PROCESSING / SUCCESS / WARNING / BLOCKED / ERROR plates were not duplicated.

Those states are the named screens:

- PROCESSING: existing extract, new extract, batch processing, batch run
- NEEDS REVIEW: match, conflicts, batch summary, batch conflicts, batch queue
- SUCCESS / PREBUILT: existing prebuilt, new prebuilt, batch complete
- WARNING / NOT ACTIVE: prebuilt, invite sent, confirmation required
- ACTIVE: activation complete only
- BLOCKED: approval summary when items remain, represented in the live screen from real conflict counts

No client is ACTIVE because a batch finished.
