# Processing Pipeline

## Stages

1. **Waiting**
2. **Removing Background** — Ideogram `fal-ai/ideogram/remove-background`
3. **Generating Transparent Master**
4. **Generating Derivatives** — Sharp crop from templates
5. **Uploading To Supabase**
6. **Registering Assets**
7. **Ready For Review**
8. **Published** — admin marks complete

## Failure handling

On error, job status → **failed** with `failedStage` and `error` message.

Admin **RETRY FROM {STAGE}** calls API with `action: "retry"` and `fromStage`.

## Requirements

- `FAL_KEY` — Ideogram background removal
- `SUPABASE_URL` + storage credentials

## API

```
POST /api/admin/product-asset-factory-run
{
  "action": "run" | "retry",
  "unitSlug": "soft-wave",
  "fromStage": "generating-derivatives",  // retry only
  "masterHeroSrc": "/assets/…"            // optional override
}
```
