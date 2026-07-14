import { useMemo } from 'react';
import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';
import {
  StudioWorldIconProvider,
  useStudioWorldIconSystem,
  STUDIO_WORLD_ICON_CATEGORIES,
} from '../../../../features/studio-world/icons';

function DiagnosticsBody() {
  const { diagnostics, manifest } = useStudioWorldIconSystem();

  const exportJson = useMemo(
    () => JSON.stringify({ diagnostics, manifest }, null, 2),
    [diagnostics, manifest]
  );

  if (!diagnostics) return <p>Loading icon diagnostics…</p>;

  return (
    <div style={{ padding: 16, fontFamily: 'monospace', fontSize: 12, color: '#e8e8e8', background: '#0a0c10', minHeight: '100vh' }}>
      <h1 style={{ fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Studio World Icon System Diagnostics</h1>
      <p>Architecture foundation — no runtime visual changes.</p>

      <section style={{ marginTop: 16 }}>
        <h2>Summary</h2>
        <ul>
          <li>Total icons: {diagnostics.totalIcons}</li>
          <li>Categories: {diagnostics.categoryCount}</li>
          <li>Certified: {diagnostics.certified}</li>
          <li>Draft: {diagnostics.draft}</li>
          <li>Deprecated: {diagnostics.deprecatedIcons.length}</li>
          <li>Unused: {diagnostics.unusedIcons.length}</li>
          <li>Missing states entries: {diagnostics.missingStates.length}</li>
          <li>Broken assets: {diagnostics.brokenAssets.length}</li>
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Largest categories</h2>
        <ul>
          {diagnostics.largestCategories.map((c) => (
            <li key={c.categoryId}>{c.categoryId}: {c.count}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Canonical categories ({STUDIO_WORLD_ICON_CATEGORIES.length})</h2>
        <ul>
          {STUDIO_WORLD_ICON_CATEGORIES.map((c) => (
            <li key={c.id}>{c.title} — {c.description}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 16 }}>
        <h2>Export diagnostic JSON</h2>
        <textarea readOnly value={exportJson} style={{ width: '100%', height: 240, background: '#111', color: '#ccc', border: '1px solid #333' }} />
      </section>
    </div>
  );
}

/** Studio World Icon System diagnostics — architecture only. */
export default function AdminStudioWorldIconSystemPage() {
  useRequireStudioWorldAdmin();

  return (
    <StudioWorldIconProvider>
      <DiagnosticsBody />
    </StudioWorldIconProvider>
  );
}
