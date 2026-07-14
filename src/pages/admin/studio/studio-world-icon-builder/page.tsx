import { useRequireStudioWorldAdmin } from '../../../../hooks/useRequireStudioWorldAdmin';

/** Icon Builder foundation placeholder — no final UI in V1 sprint. */
export default function AdminStudioWorldIconBuilderPage() {
  useRequireStudioWorldAdmin();

  return (
    <div style={{ padding: 24, fontFamily: 'Futura PT, sans-serif', color: '#1a1a1a' }}>
      <h1>Studio World Icon Builder</h1>
      <p>Foundation scaffold only. Future capabilities:</p>
      <ul>
        <li>Search and category browser</li>
        <li>State and theme preview</li>
        <li>SVG / PNG export and batch export</li>
        <li>Future animation and variable icon editor</li>
      </ul>
      <p>
        Use <a href="/admin/studio/studio-world-icon-system">Icon System Diagnostics</a> for registry health.
      </p>
    </div>
  );
}
