import type { ReactNode } from 'react';

export const vaultGlass = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(165deg, #f8fafc 0%, #eef2ff 35%, #fafafa 100%)',
    color: '#171717',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: {
    maxWidth: 920,
    margin: '0 auto',
    padding: '28px 20px 56px',
  } as const,
  h1: {
    fontSize: 32,
    fontWeight: 600,
    letterSpacing: '-0.03em',
    margin: '0 0 10px',
  } as const,
  sub: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 1.55,
    margin: '0 0 28px',
    maxWidth: 640,
  } as const,
  glassCard: (delay = 0) =>
    ({
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      border: '1px solid rgba(255, 255, 255, 0.85)',
      boxShadow: '0 8px 32px rgba(15, 23, 42, 0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
      borderRadius: 16,
      padding: 22,
      marginBottom: 14,
      animation: `vaultFadeUp 0.5s ease ${delay}ms both`,
    }) as const,
  btn: {
    padding: '11px 18px',
    borderRadius: 10,
    border: '1px solid rgba(148, 163, 184, 0.5)',
    background: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
  } as const,
  btnPrimary: {
    padding: '13px 22px',
    borderRadius: 10,
    border: 'none',
    background: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
    color: '#fff',
    fontSize: 15,
    cursor: 'pointer',
    fontWeight: 600,
    boxShadow: '0 4px 14px rgba(15, 23, 42, 0.18)',
  } as const,
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: 14,
  } as const,
  metric: {
    ...({
      background: 'rgba(255, 255, 255, 0.72)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.85)',
      borderRadius: 14,
      padding: 18,
    } as const),
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 10,
    border: '1px solid rgba(148, 163, 184, 0.45)',
    fontSize: 16,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
    background: 'rgba(255,255,255,0.85)',
  },
  agreementScroll: {
    maxHeight: 180,
    overflowY: 'auto' as const,
    padding: 16,
    borderRadius: 10,
    background: 'rgba(248, 250, 252, 0.9)',
    border: '1px solid rgba(226, 232, 240, 0.9)',
    fontSize: 14,
    lineHeight: 1.6,
    color: '#475569',
    marginBottom: 12,
  },
};

export function VaultBtn({
  children,
  onClick,
  primary,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  primary?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...(primary ? vaultGlass.btnPrimary : vaultGlass.btn),
        opacity: disabled ? 0.45 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function VaultStylesInjector() {
  return (
    <style>{`
      @keyframes vaultFadeUp {
        from { opacity: 0; transform: translateY(12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}
