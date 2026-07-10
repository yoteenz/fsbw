import { useEffect, type ReactNode } from 'react';
import { getLastDiagnosticCheckpoint, markDiagnosticCheckpoint } from './checkpoints';
import { clearDiagnosticPlainDom, getBundleVersionLabel } from './plain-dom';

type Props = {
  route: string;
  children: ReactNode;
};

/** Marks terminal checkpoints after React commit; removes plain-DOM fallback. */
export function IsolatedDiagnosticShell({ route, children }: Props) {
  useEffect(() => {
    clearDiagnosticPlainDom();
    markDiagnosticCheckpoint('diagnostic:component-mounted', route);
    markDiagnosticCheckpoint('diagnostic:ready', route);
  }, [route]);

  return (
    <>
      <div
        data-isolated-diagnostic-shell={route}
        style={{
          padding: '6px 12px',
          background: '#14532d',
          color: '#bbf7d0',
          fontFamily: 'ui-monospace, monospace',
          fontSize: 10,
        }}
      >
        Isolated diagnostic entry · checkpoint: {getLastDiagnosticCheckpoint()} · bundle:{' '}
        {getBundleVersionLabel()}
      </div>
      {children}
    </>
  );
}
