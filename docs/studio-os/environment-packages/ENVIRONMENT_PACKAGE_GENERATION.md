# Environment Package Generation

## Parent job

`ENVIRONMENT_PACKAGE_PRODUCTION` — one per approved package.

## Child jobs (dependency-aware)

1. `ENVIRONMENT_DESKTOP_RENDER` (21:9 canonical master)
2. `ENVIRONMENT_MOBILE_RENDER`, `ENVIRONMENT_TABLET_RENDER` (depend on desktop)
3. Hero + thumbnails (depend on desktop)
4. Blueprint → construction → lighting → materials → manifest
5. `ENVIRONMENT_PACKAGE_VALIDATION`

## Resume behavior

Completed outputs are not regenerated. Failed outputs retry individually. Worker is idempotent across refresh/deploy.

## FAL integration

When `ENABLE_PACKAGE_PRODUCTION_GENERATION=1`, renders use existing `studioBuilderGeneration` transport. When OFF, preview sources are copied to controlled storage for governed proof without provider spend.
