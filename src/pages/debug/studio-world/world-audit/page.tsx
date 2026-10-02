import registry from '../../../../../docs/studio-world/studio-world-concept-registry.json';
import { STUDIO_WORLD_ROUTE_REGISTRY } from '../../../../studio-os-core/studio-world/route-registry';

export default function StudioWorldAuditDebugPage() {
  const concepts = registry.concepts ?? [];
  const places = STUDIO_WORLD_ROUTE_REGISTRY.length;
  const byOwner = concepts.reduce<Record<string, number>>((acc, c) => {
    const k = c.product_owner_candidate ?? 'UNCLEAR';
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div style={{ fontFamily: 'monospace', padding: 16, maxWidth: 960, margin: '0 auto', fontSize: 12 }}>
      <h1 style={{ fontSize: 18 }}>Studio World — World Architecture Audit (read-only)</h1>
      <p style={{ color: '#555' }}>
        Sprint P0.STUDIOWORLD.WORLD-ARCHITECTURE.FORENSIC-AUDIT1 · Docs are authoritative; this page is a
        counter snapshot.
      </p>
      <ul>
        <li>Concept registry entries: {concepts.length}</li>
        <li>Route → place mappings: {places}</li>
        <li>Orphaned concepts doc: docs/studio-world/STUDIO_WORLD_ORPHANED_CONCEPTS.md</li>
        <li>Master audit: docs/studio-world/STUDIO_WORLD_WORLD_ARCHITECTURE_FORENSIC_AUDIT.md</li>
      </ul>
      <h2 style={{ fontSize: 14 }}>Product owner candidates (sample registry)</h2>
      <pre style={{ background: '#f4f4f4', padding: 8 }}>{JSON.stringify(byOwner, null, 2)}</pre>
    </div>
  );
}
