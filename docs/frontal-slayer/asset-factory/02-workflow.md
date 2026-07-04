# Workflow

```
Photography Bible
  ↓
Approved Master Hero Portrait
  ↓
Asset Factory
  ↓
Background Removal (Ideogram)
  ↓
Transparent Master
  ↓
Derivative Generation (crop templates)
  ↓
Supabase Upload
  ↓
Asset Registry
  ↓
Ready For Review
  ↓
Published (admin)
```

Trigger: **RUN PIPELINE** in admin or `POST /api/admin/product-asset-factory-run`.

Retry: pass `action: "retry"` and `fromStage` to restart from the failed step.
