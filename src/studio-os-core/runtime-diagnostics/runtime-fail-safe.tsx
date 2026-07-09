import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { forceReloadForStaleChunks } from '../../utils/chunkLoadRecovery';
import { resetLocalStudioCache } from '../../utils/studioOsBrowserStorage';
import { resetStudioBootstrap } from '../bootstrap';
import { GENESIS_STORAGE_KEY } from '../genesis/constants';

/** RuntimeFailSafe™ — visible recovery when lazy imports or boot fail. */
export function RuntimeFailSafe({
  title = 'Studio OS boot interrupted',
  message,
  detail,
}: {
  title?: string;
  message: string;
  detail?: string;
}) {
  const clearRuntimeCache = () => {
    try {
      resetStudioBootstrap();
      resetLocalStudioCache();
      localStorage.removeItem(GENESIS_STORAGE_KEY);
    } catch {
      /* ignore */
    }
    forceReloadForStaleChunks();
  };

  return (
    <div
      style={{
        minHeight: '50vh',
        padding: '24px',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        color: '#1a1a1a',
        background: '#fff',
      }}
      data-studio-runtime-fail-safe
    >
      <h1 style={{ fontSize: '16px', color: '#eb1c24', margin: '0 0 12px' }}>{title}</h1>
      <p style={{ margin: '0 0 8px' }}>{message}</p>
      {detail ? (
        <pre
          style={{
            marginTop: '12px',
            padding: '12px',
            background: '#f5f5f5',
            overflow: 'auto',
            fontSize: '11px',
            whiteSpace: 'pre-wrap',
            maxHeight: '200px',
          }}
        >
          {detail}
        </pre>
      ) : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => forceReloadForStaleChunks()}
          style={btnStyle}
        >
          Reload app
        </button>
        <button type="button" onClick={clearRuntimeCache} style={btnStyle}>
          Clear local runtime cache
        </button>
        <Link to="/admin/studio/health" style={{ ...btnStyle, textDecoration: 'none', display: 'inline-block' }}>
          Return to safe health route
        </Link>
      </div>
    </div>
  );
}

const btnStyle: CSSProperties = {
  padding: '8px 12px',
  border: '1px solid #0a0a0a',
  background: '#fff',
  color: '#0a0a0a',
  borderRadius: '6px',
  cursor: 'pointer',
  fontSize: '12px',
};
