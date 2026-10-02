# Vercel Git deploy policy (FSBW monorepo)

## PR CI vs Vercel

- **Code CI for pull requests:** `.github/workflows/fsbw-pr-verify.yml` (`FSBW PR Verify`).
- **Vercel commit statuses** (`Vercel – fsbw`, `fsbaw`, `admin-globe-embed`) reflect the **Vercel Git integration**, not GitHub Actions test results.

When Vercel shows **Account is blocked**, unblock or unpause the team in the [Vercel dashboard](https://vercel.com/knowledge/why-is-my-account-deployment-blocked) (Spend Management, billing, plan limits). No git change can renew a blocked account.

## `git.deploymentEnabled` in `vercel.json`

Each linked project reads config from its **Root Directory**:

| Vercel project (typical) | Config file |
|--------------------------|-------------|
| fsbw | `/vercel.json` |
| fsbaw (AIO) | `/all-in-one-enterprises/vercel.json` |
| admin-globe-embed | `/embed/admin-globe/vercel.json` |

Setting `"git": { "deploymentEnabled": false }` stops **automatic Git-triggered** deploys for that project. Production releases can still use Vercel CLI or dashboard redeploy when the account is active.

**Before re-enabling Git deploys on `master`**, restore a master-only policy, for example:

```json
"git": {
  "deploymentEnabled": {
    "master": true,
    "cursor/**": false,
    "feature/**": false
  }
}
```

Plus `scripts/vercel-should-build.sh` (non-`master` skip and `[sync-only]` commits).
