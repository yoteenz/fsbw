import type { ReactNode } from 'react';

export const siStyles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #f8fafc 0%, #f1f5f9 50%, #fafafa 100%)',
    color: '#0f172a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: { maxWidth: 960, margin: '0 auto', padding: '32px 20px 48px' } as const,
  h1: { fontSize: 30, fontWeight: 600, letterSpacing: '-0.03em', margin: '0 0 8px' } as const,
  sub: { fontSize: 15, color: '#64748b', lineHeight: 1.55, margin: '0 0 24px' } as const,
  card: {
    background: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(226,232,240,0.9)',
    borderRadius: 14,
    padding: 20,
    marginBottom: 14,
    boxShadow: '0 4px 24px rgba(15,23,42,0.04)',
  } as const,
  btn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    background: '#fff',
    fontSize: 14,
    cursor: 'pointer',
  } as const,
  btnPrimary: {
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#0f172a',
    color: '#fff',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  } as const,
  input: {
    width: '100%',
    padding: '11px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 15,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  },
  label: { display: 'block', fontSize: 13, color: '#64748b', marginBottom: 6 } as const,
  table: { width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 },
  btnRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 10,
    marginTop: 8,
  },
  urlInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 13,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    marginBottom: 8,
    boxSizing: 'border-box' as const,
    wordBreak: 'break-all' as const,
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    fontSize: 14,
    lineHeight: 1.55,
    marginBottom: 8,
    boxSizing: 'border-box' as const,
    minHeight: 200,
    resize: 'vertical' as const,
  },
};

export function SiBtn({
  children,
  onClick,
  primary,
  disabled,
  fullWidth,
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(primary ? siStyles.btnPrimary : siStyles.btn),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        minHeight: 44,
        minWidth: fullWidth ? '100%' : undefined,
        flex: fullWidth ? '1 1 100%' : undefined,
      }}
    >
      {children}
    </button>
  );
}
