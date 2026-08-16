# SECRET MANAGEMENT — All In One

## Rules

- Never in source control, client bundle, docs, or logs
- Service role: server-only — **never** `VITE_*`
- Staging and production keys separated where provider supports

## Classification

| Secret | Staging | Production |
|--------|---------|------------|
| Supabase service role | staging project | production project |
| Webhook secrets | staging endpoints | production endpoints |
| Email API key | sandbox | production sender |
| SMS credentials | sandbox | registered sender |
| Payment keys | test/sandbox | live merchant |

## Rotation

Document owner, purpose, rotation/revocation process — values not stored in repo.

## Scanning

```bash
npm run secret-scan
```

## Credential updates

Prefer host secret manager over in-app credential UI for Sprint 23.
