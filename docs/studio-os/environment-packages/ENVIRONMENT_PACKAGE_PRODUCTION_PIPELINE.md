# Environment Package Production Pipeline

## Flow

Design Variant → Package (durable) → Production Readiness Gate → Founder approval + estimate → Scheduler parent job `ENVIRONMENT_PACKAGE_PRODUCTION` → child output jobs → storage → consistency validation → Founder review → Canonical promotion → CDS handoff.

## API routes

| Route | Purpose |
|-------|---------|
| `POST /api/admin/environment-package-migrate` | Idempotent seed of six Experience Lab reception packages |
| `GET /api/admin/environment-package-status` | Package diagnostics + outputs + jobs |
| `POST /api/admin/environment-package-approve` | Founder approval + job creation |
| `POST /api/admin/environment-package-worker` | Advance/resume generation jobs |
| `POST /api/admin/environment-package-promote` | Canonical promotion + CDS handoff |

## Feature flags (server)

- `ENABLE_PACKAGE_PERSISTENCE` (default ON)
- `ENABLE_PACKAGE_PRODUCTION_GENERATION` (default OFF until verified)
- `ENABLE_PACKAGE_CDS_HANDOFF` (default OFF)
- `ENABLE_PACKAGE_CANONICAL_PROMOTION` (default OFF)

## Model routing

- Desktop canonical master: Nano Banana Pro full-scene (`fal-ai/nano-banana-pro/edit`)
- Mobile/tablet companions: derived from canonical master (edit/recomposition)
- Derived outputs: blueprint, construction, lighting, materials, manifest

## Non-destructive UI

Experience Lab drawer exposes live readiness, progress, and actions without layout changes.
