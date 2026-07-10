import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getShellV2HeartbeatSnapshot, type ShellV2HeartbeatSnapshot } from '../shellV2Heartbeat';
import { getShellV2MatrixSnapshot, getShellV2MaxStage } from '../shellV2Matrix';

function readHeartbeat(): ShellV2HeartbeatSnapshot {
  const win = window as unknown as { __SHELL_V2_HB?: () => ShellV2HeartbeatSnapshot };
  if (typeof win.__SHELL_V2_HB === 'function') return win.__SHELL_V2_HB();
  return getShellV2HeartbeatSnapshot();
}

/** Diagnostic route — heartbeat + provider matrix (no legacy deps). */
export default function ShellV2DiagnosticPage() {
  const [hb, setHb] = useState<ShellV2HeartbeatSnapshot>(() => readHeartbeat());
  const matrix = getShellV2MatrixSnapshot();
  const maxStage = getShellV2MaxStage();
  const ready = hb.heartbeat >= 8;

  useEffect(() => {
    const id = window.setInterval(() => setHb(readHeartbeat()), 300);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="shell-v2-root" data-shell-v2="diagnostic">
      <header className="shell-v2-header">
        <h1>Shell V2 Diagnostic</h1>
        <p>
          {ready ? (
            <span className="shell-v2-ok">READY — heartbeat alive</span>
          ) : (
            <span>Warming heartbeat…</span>
          )}
        </p>
      </header>
      <main className="shell-v2-main">
        <div className="shell-v2-card">
          <h2>Heartbeat (plain DOM)</h2>
          <pre style={{ margin: 0, fontSize: 12 }}>
            {JSON.stringify(hb, null, 2)}
          </pre>
          <p style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
            If hb/raf/to stop while UI freezes, the main thread is blocked. Override stage:{' '}
            <code>?v2Stage=N</code>
          </p>
        </div>

        <div className="shell-v2-card">
          <h2>Provider matrix (max stage {maxStage})</h2>
          <table className="shell-v2-matrix">
            <thead>
              <tr>
                <th>Stage</th>
                <th>Subsystem</th>
                <th>Status</th>
                <th>Modules</th>
              </tr>
            </thead>
            <tbody>
              {matrix.rows.map((row) => (
                <tr key={row.stage}>
                  <td>{row.stage}</td>
                  <td>{row.label}</td>
                  <td className={`shell-v2-status-${row.status}`}>{row.status.toUpperCase()}</td>
                  <td>{row.modules.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p>
          <Link className="shell-v2-link" to="/v2">
            ← Public route
          </Link>
        </p>
      </main>
    </div>
  );
}
