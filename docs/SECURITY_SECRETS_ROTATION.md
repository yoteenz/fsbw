# Security: rotate leaked credentials and scrub Git history

If **`.env.wig-preview`** (or any env file with real keys) was ever committed or pushed, treat **Fal** and **Supabase service-role** credentials as **compromised** until rotated.

## 1. Rotate keys (dashboards)

### Fal (`FAL_KEY`)

1. Open [fal.ai](https://fal.ai) → account / API keys.
2. **Revoke** the leaked key.
3. Create a **new** key.
4. Update the new value in:
   - Your **local** untracked `.env.wig-preview` (copy from `.env.wig-preview.example.txt`)
   - **Vercel** project env (if used there)
   - Any CI or machine that ran wig-preview scripts

### Supabase (`SUPABASE_SERVICE_ROLE_KEY`)

1. Supabase Dashboard → **Project Settings** → **API**.
2. Under **service_role**, use **Rotate** (or reset JWT secret if your project uses that flow).
3. Update **Vercel** env: `SUPABASE_SERVICE_ROLE_KEY`.
4. Update local `.env.wig-preview` / `.env.local` — **never commit** the new value.

The **anon** key is public by design; rotating the **service role** is what matters for server-side abuse.

## 2. Stop tracking secret files

The repo should only contain **example** env files (placeholders). Real files are gitignored:

- `.env.wig-preview`
- `.env.wig-preview.txt`
- `.env*.local`

If a secret file was tracked before ignore rules:

```bash
git rm --cached .env.wig-preview
git commit -m "Stop tracking wig preview env secrets"
```

Keep your filled copy **only on disk** (untracked).

## 3. Purge secrets from Git history (if pushed)

Removing a file in a new commit does **not** erase old blobs on the remote. If the leak was pushed:

```bash
# Install git-filter-repo if needed, then from repo root:
git filter-repo --path .env.wig-preview --invert-paths --force
git push origin --force --all
```

Or use [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/). Coordinate with anyone who has cloned the repo; they must re-clone or reset after a history rewrite.

After rotation + scrub, assume scanners may still find old commits until history is rewritten.

## 4. App passwords (browser storage)

The app **no longer stores** account passwords in `localStorage` or auth backup cookies. Sign-in uses **Supabase Auth**; admin sync uses the **Bearer session** (`syncProfileWithToken`), not stored passwords.
