/**
 * Developer notice — All In One moved to standalone application (Sprint 22).
 * Shown at legacy Frontal Slayer routes: /all-in-one, /debug/all-in-one
 */

const STANDALONE_DEV_URL = import.meta.env.VITE_AIO_STANDALONE_URL || 'http://localhost:5173';

export default function LegacyAioMovedNotice() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: '#0a0a0a',
        color: '#f5f5f5',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ maxWidth: 520, textAlign: 'center' }}>
        <p style={{ color: '#c9a227', letterSpacing: '0.08em', textTransform: 'uppercase', fontSize: '0.75rem' }}>
          All In One Enterprises Inc.
        </p>
        <h1 style={{ fontSize: '1.5rem', margin: '1rem 0' }}>All In One has moved</h1>
        <p style={{ lineHeight: 1.6, color: '#a3a3a3', marginBottom: '1.5rem' }}>
          The canonical All In One application now runs as a standalone project. This legacy route inside the
          Frontal Slayer repository is frozen and no longer receives feature updates.
        </p>
        <a
          href={STANDALONE_DEV_URL}
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.25rem',
            background: '#c9a227',
            color: '#0a0a0a',
            textDecoration: 'none',
            borderRadius: 6,
            fontWeight: 600,
          }}
        >
          Open standalone app
        </a>
        <p style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#737373' }}>
          Local dev: <code style={{ color: '#d4d4d4' }}>cd all-in-one-enterprises && npm run dev</code>
        </p>
      </div>
    </div>
  );
}
