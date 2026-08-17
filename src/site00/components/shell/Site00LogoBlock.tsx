type Site00LogoBlockProps = {
  locationLabel?: string;
  showBracket?: boolean;
};

export function Site00LogoBlock({ locationLabel, showBracket = true }: Site00LogoBlockProps) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            fontFamily: 'var(--site-font-sans)',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '0.06em',
          }}
        >
          SITE 00
        </span>
        <span className="site00-diamond" aria-hidden="true" />
      </div>
      {locationLabel && showBracket ? (
        <div className="site00-bracket-label" style={{ marginTop: 8 }}>
          {locationLabel}
        </div>
      ) : null}
    </div>
  );
}
