import { Link } from 'react-router-dom';
import { getShellV2MaxStage } from '../shellV2Matrix';

/** Static public route — no auth, bootstrap, or providers. */
export default function ShellV2PublicPage() {
  const stage = getShellV2MaxStage();

  return (
    <div className="shell-v2-root" data-shell-v2="public">
      <header className="shell-v2-header">
        <h1>Studio App Shell V2</h1>
        <p>Isolated production-safe shell — stage {stage} active</p>
      </header>
      <main className="shell-v2-main">
        <div className="shell-v2-card">
          <h2>Status</h2>
          <p className="shell-v2-ok">Responsive — minimal shell rendered immediately.</p>
          <p style={{ marginTop: 12, fontSize: 13, color: '#6b7280' }}>
            Legacy startup tree is not loaded on <code>/v2/*</code> paths. Incremental provider
            matrix adds one subsystem per stage.
          </p>
        </div>
        <p>
          <Link className="shell-v2-link" to="/v2/diagnostic">
            Open diagnostic route →
          </Link>
          {' · '}
          <a className="shell-v2-link" href="/">
            Legacy shell (/)
          </a>
        </p>
      </main>
    </div>
  );
}
