# ENVIRONMENT CONFIGURATION

## Modes

| `VITE_AIO_DATA_MODE` | Behavior |
|----------------------|----------|
| `demo` (default) | Local demo store, fictional data |
| `local` | Local/test persistence |
| `supabase` | Dedicated AIO Supabase (requires URL + anon key) |

## Required variables (supabase mode)

- `VITE_AIO_SUPABASE_URL`
- `VITE_AIO_SUPABASE_ANON_KEY`

## Optional

- `VITE_AIO_ENVIRONMENT` — `preview` | `production` (future)
- `VITE_AIO_APP_URL` — canonical URL for generated links
- `VITE_AIO_AUTH_MODE` / `VITE_AIO_STORAGE_MODE`

## Server-only (migrations/CI)

- `AIO_SUPABASE_PROJECT_REF`
- `AIO_SUPABASE_SERVICE_ROLE_KEY`

## Hard rules

- **No** `VITE_SUPABASE_URL` (Frontal Slayer)
- **No** fallback to FS secrets
- Missing supabase config → fail with clear error or stay in demo

See `.env.example`.
