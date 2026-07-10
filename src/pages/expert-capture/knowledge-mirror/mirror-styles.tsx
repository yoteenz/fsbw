import type { ReactNode } from 'react';

export const mirrorStyles = {
  page: {
    minHeight: '100vh',
    background: '#ffffff',
    color: '#171717',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif',
  } as const,
  container: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '24px 20px 48px',
  } as const,
  h1: { fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', margin: '0 0 8px' } as const,
  sub: { fontSize: 15, color: '#737373', lineHeight: 1.5, margin: '0 0 24px' } as const,
  card: {
    border: '1px solid #e5e5e5',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    background: '#fafafa',
  } as const,
  sectionTitle: { fontSize: 18, fontWeight: 600, margin: '32px 0 12px' } as const,
  btn: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1px solid #d4d4d4',
    background: '#fff',
    fontSize: 14,
    cursor: 'pointer',
    fontWeight: 500,
  } as const,
  btnPrimary: {
    padding: '12px 20px',
    borderRadius: 8,
    border: 'none',
    background: '#171717',
    color: '#fff',
    fontSize: 15,
    cursor: 'pointer',
    fontWeight: 600,
  } as const,
  badge: (color: string) =>
    ({
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      background: color,
      color: '#fff',
      marginRight: 6,
    }) as const,
  nav: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 8,
    marginBottom: 24,
    paddingBottom: 16,
    borderBottom: '1px solid #e5e5e5',
  },
  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #d4d4d4',
    fontSize: 16,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
  },
  textarea: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 8,
    border: '1px solid #d4d4d4',
    fontSize: 15,
    marginBottom: 12,
    boxSizing: 'border-box' as const,
    minHeight: 120,
    lineHeight: 1.5,
    fontFamily: 'inherit',
  },
};

export function MirrorBtn({
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
        ...(primary ? mirrorStyles.btnPrimary : mirrorStyles.btn),
        opacity: disabled ? 0.5 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  );
}

export function statusColor(status: string): string {
  if (status.includes('active') || status.includes('passed') || status.includes('approved')) return '#16a34a';
  if (status.includes('draft') || status.includes('pending') || status.includes('review')) return '#ca8a04';
  if (status.includes('reject') || status.includes('fail') || status.includes('restricted')) return '#dc2626';
  if (status.includes('outdated') || status.includes('superseded') || status.includes('conflict')) return '#ea580c';
  return '#737373';
}
