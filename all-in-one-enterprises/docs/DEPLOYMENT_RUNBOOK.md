# DEPLOYMENT RUNBOOK — All In One

## Pre-deploy

1. `npm run qa` (typecheck, tests, isolation, env validation)
2. `npm run secret-scan`
3. Confirm target environment variables in host secret store
4. Staging migration dry-run PASS

## Deploy staging

1. Push to staging branch / trigger staging project
2. Set `VITE_AIO_ENVIRONMENT=staging`, supabase staging credentials
3. Smoke: Home, Login, Portal, Office, `/office/system/production`, health checks
4. Run staging QA matrix (Customer A/B, staff roles)

## Deploy production

1. Founder says **deploy now**
2. `./scripts/agent-commit.sh --deploy-now` (from monorepo root if applicable)
3. Set production secrets — **never** demo modes
4. `AIO_CONFIRM_PRODUCTION=yes-i-understand-production npm run migrate:production` (after project exists)
5. Production smoke with internal accounts only

## Rollback

- Redeploy previous known-good release from host deployment history
- Database: forward repair or restore from backup — **no** automatic down migrations

## Release identifier

Set at build time: `VITE_AIO_RELEASE_ID`, `VITE_AIO_COMMIT_SHA`
