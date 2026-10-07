# IFTA founder review mocks

Static, self-contained copies of the live IFTA pages for founder review on any device. Each page shows the desktop
(≥ 1200 px), tablet (700–1199 px) or phone (< 700 px) layout for the viewer's width.

| Mock | Live route it copies | Published link |
|---|---|---|
| Client filing room | `/portal/workspaces/ifta/2026-Q3` (Pioneer Fleet demo data) | https://claude.ai/artifact/JDEeSCFdEea3JUTDkYxMzw |
| Public IFTA page | `/services/ifta-filing` (labelled sample quarter) | https://claude.ai/artifact/WQDLzooEj26KangyyzKssx |
| Founder / staff case | `/office/workspaces/ifta/client-c/2026-Q3` | https://claude.ai/artifact/LbuNRAW5JrDtnevYrjSfQ4 |

**What works in a mock:**
- tabs, View All, quarter tasks and quick actions
- the bottom rail
- in-page section links

Search, notifications, menus and links to other pages are inert. Each file names the commit it was built from (`<!-- ifta-mock-sha: … -->`, and the line at the foot of the page).

## Rebuild

```bash
cd all-in-one-enterprises
npm run ifta:mocks            # → .ifta-mocks/*.html (git-ignored); starts and stops its own dev server
```

**Publish.** The links do not follow `master` by themselves. A Claude session republishes each file to its link above: the Artifact tool with `url` set to that link, after reading it once. The link stays the same, and open viewers get the new version.

**Automatic refresh.** A scheduled routine ("AIO IFTA mock refresh") checks `master` every 6 hours. When the commit differs from the one the published mocks were built from, it rebuilds them and republishes to the same three links; otherwise it stops. It can also be run on demand from the Routines list.

## V2 refinement (static, for comparison)

These are the V2 fine-tune snapshots. The composition is identical to V1; only type size, weight, tracking and contrast are refined. They are built from a worktree on `aace9d2d` with `v2-reference.patch` applied (not live), and are not refreshed by the routine. Details are in `../authority-refinement-v2/README.md`.

| Mock | V2 link |
|---|---|
| Public IFTA page | https://claude.ai/artifact/Mwz9TDJadxqKMPpcoBxxCR |
| Client filing room | https://claude.ai/artifact/D4rPXM9faMgPse25oUxgzt |
| Founder / staff case | https://claude.ai/artifact/2562hEnELiQyQSjCkoB5FR |
