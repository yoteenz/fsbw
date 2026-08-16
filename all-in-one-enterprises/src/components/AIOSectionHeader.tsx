type Props = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: 'left' | 'center';
  light?: boolean;
};

export function AIOSectionHeader({ eyebrow, title, subtitle, align = 'left', light }: Props) {
  const alignStyle = align === 'center' ? { textAlign: 'center' as const, margin: '0 auto' } : undefined;

  return (
    <header style={alignStyle} className={align === 'center' ? 'aio-container' : undefined}>
      {eyebrow ? (
        <p className="aio-label" style={{ color: light ? 'var(--aio-gold-light)' : 'var(--aio-gold-dark)', marginBottom: '0.75rem' }}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className="aio-display-md" style={{ color: light ? 'var(--aio-white)' : undefined, marginBottom: subtitle ? '0.75rem' : 0 }}>
        {title}
      </h2>
      {subtitle ? (
        <p style={{ color: light ? 'rgba(255,255,255,0.7)' : 'var(--aio-gray-600)', maxWidth: align === 'center' ? '40rem' : '36rem', lineHeight: 1.65 }}>
          {subtitle}
        </p>
      ) : null}
    </header>
  );
}
