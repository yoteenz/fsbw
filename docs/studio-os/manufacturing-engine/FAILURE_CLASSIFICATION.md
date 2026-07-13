# Failure Classification™

Failures are precisely classified — never generic "Generation Failed."

## Classes

Geometry · Material · Lighting · Transparency · Silhouette · Isolation · Perspective · Scale · Reflection · Background · Architecture Leakage · Prompt Drift · Model Drift · Texture Drift · Reference Drift · Organization Asset Drift

## API

```typescript
const failures = classifyInspectionFailures({ jobId, assetId, failedChecks, output });
classifyFailureLabel(failure.failureClass); // "Architecture Leakage"
```
