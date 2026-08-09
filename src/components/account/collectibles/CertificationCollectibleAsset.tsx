import type { EducationCollectibleDefinition } from '../../../content/education/types';

type CertificationCollectibleAssetProps = {
  definition?: EducationCollectibleDefinition;
  earned?: boolean;
  title?: string;
  size?: number;
  className?: string;
};

/** Placeholder crystal/acrylic certification collectible — final 3D asset TBD. */
export function CertificationCollectibleAsset({
  definition,
  earned = false,
  title,
  size = 120,
  className,
}: CertificationCollectibleAssetProps) {
  const label = title ?? definition?.title ?? 'CERTIFICATION';
  const opacity = earned ? 1 : 0.45;
  const borderGlow = earned
    ? '0 0 24px rgba(235,28,36,0.35), inset 0 0 20px rgba(255,255,255,0.4)'
    : 'inset 0 0 16px rgba(255,255,255,0.25)';

  return (
    <div
      className={className}
      role="img"
      aria-label={earned ? `${label} certification earned` : `${label} certification locked preview`}
      style={{
        width: size,
        height: Math.round(size * 1.25),
        margin: '0 auto',
        position: 'relative',
        opacity,
        filter: earned ? 'none' : 'grayscale(0.85)',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: '8%',
          border: '1.5px solid rgba(255,255,255,0.55)',
          borderRadius: 4,
          background:
            'linear-gradient(145deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08)), linear-gradient(180deg, rgba(240,240,240,0.5), rgba(200,200,200,0.15))',
          boxShadow: borderGlow,
          backdropFilter: 'blur(8px)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: '4%',
          border: '1px solid rgba(235,28,36,0.35)',
          borderRadius: 6,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '18%',
          transform: 'translateX(-50%)',
          width: '18%',
          height: '18%',
          borderRadius: '50%',
          background: earned
            ? 'radial-gradient(circle, rgba(255,255,255,0.95), rgba(200,200,200,0.4))'
            : 'rgba(255,255,255,0.2)',
          boxShadow: earned ? '0 0 8px rgba(255,255,255,0.8)' : 'none',
        }}
      />
      <p
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: '14%',
          margin: 0,
          textAlign: 'center',
          fontFamily: '"Futura PT Medium"',
          fontSize: Math.max(7, size * 0.07),
          letterSpacing: '0.08em',
          color: earned ? '#EB1C24' : '#999',
          textTransform: 'uppercase',
          padding: '0 8%',
          lineHeight: 1.2,
        }}
      >
        {earned ? 'CERTIFIED' : 'LOCKED'}
      </p>
    </div>
  );
}
