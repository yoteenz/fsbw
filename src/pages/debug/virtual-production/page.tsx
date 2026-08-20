import { Link } from 'react-router-dom';
import { PRODUCTION_PROVIDERS, OPENART_DIRECTOR_INTEGRATION } from '../../../studio-os-core/virtual-production';

const DEBUG_ROUTES = [
  { path: '/__virtual-production', label: 'Production OS Home' },
  { path: '/__virtual-production/brand-canon', label: 'Brand Canon' },
  { path: '/__virtual-production/character-canon', label: 'Character Canon' },
  { path: '/__virtual-production/campaign', label: 'Campaign' },
  { path: '/__virtual-production/storyboard', label: 'Storyboard' },
  { path: '/__virtual-production/shot-board', label: 'Shot Board' },
  { path: '/__virtual-production/shot-detail', label: 'Shot Detail' },
  { path: '/__virtual-production/production', label: 'Production' },
  { path: '/__virtual-production/qc', label: 'QC' },
  { path: '/__virtual-production/repair', label: 'Repair' },
  { path: '/__virtual-production/assembly', label: 'Assembly' },
];

export default function VirtualProductionDebugHomePage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'system-ui', background: '#0a0a0c', color: '#f2f0eb', minHeight: '100vh' }}>
      <h1 style={{ letterSpacing: '0.08em', fontSize: '1.1rem' }}>STUDIO WORLD · VIRTUAL PRODUCTION OS</h1>
      <p style={{ color: '#8a8798', maxWidth: 640 }}>
        Debug / review routes for campaign continuity foundation. Admin workspace:{' '}
        <Link to="/admin/studio/virtual-production" style={{ color: '#c9a962' }}>
          /admin/studio/virtual-production
        </Link>
      </p>

      <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.06em', marginTop: '1.5rem' }}>Debug Routes</h2>
      <ul>
        {DEBUG_ROUTES.map((r) => (
          <li key={r.path}>
            <Link to={r.path} style={{ color: '#c9a962' }}>
              {r.path}
            </Link>{' '}
            — {r.label}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.06em', marginTop: '1.5rem' }}>Production Providers</h2>
      <ul>
        {PRODUCTION_PROVIDERS.map((p) => (
          <li key={p.id} style={{ marginBottom: '0.35rem' }}>
            <strong>{p.label}</strong> ({p.integrationMode}) — {p.statusMessage}
          </li>
        ))}
      </ul>

      <h2 style={{ fontSize: '0.85rem', letterSpacing: '0.06em', marginTop: '1.5rem' }}>OpenArt Director</h2>
      <pre style={{ background: '#12121a', padding: '1rem', fontSize: '0.75rem', overflow: 'auto' }}>
        {JSON.stringify(OPENART_DIRECTOR_INTEGRATION, null, 2)}
      </pre>
    </div>
  );
}
