import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioCreativeWidgetProps = {
  label: string;
  value: string;
  subvalue?: string;
  accentHex?: string;
  large?: boolean;
  className?: string;
};

export function AdminStudioCreativeWidget({
  label,
  value,
  subvalue,
  accentHex = ADMIN_STUDIO_THEME.accent,
  large,
  className = '',
}: AdminStudioCreativeWidgetProps) {
  return (
    <div
      className={`p-2.5 bg-white/70 border ${className}`}
      style={{
        background: ADMIN_STUDIO_THEME.panelBg,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        borderTop: `2px solid ${accentHex}`,
      }}
    >
      <p
        className="text-[6px] font-futura uppercase mb-1 tracking-wider"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        {label}
      </p>
      <p
        className="leading-tight truncate"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          fontSize: large ? '13px' : '11px',
          color: ADMIN_STUDIO_THEME.textPrimary,
        }}
        title={value}
      >
        {value}
      </p>
      {subvalue ? (
        <p
          className="text-[6px] font-futura uppercase mt-0.5 truncate"
          style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
          title={subvalue}
        >
          {subvalue}
        </p>
      ) : null}
    </div>
  );
}

type AdminStudioCreativeScoreRingProps = {
  label: string;
  score: number;
  threshold?: number;
};

export function AdminStudioCreativeScoreRing({ label, score, threshold }: AdminStudioCreativeScoreRingProps) {
  const passes = threshold ? score >= threshold : true;
  const color = passes ? (score >= 90 ? '#16A34A' : ADMIN_STUDIO_THEME.accent) : '#CA8A04';

  return (
    <div
      className="p-3 text-center border bg-white/80"
      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}
    >
      <p
        className="text-[7px] font-futura uppercase mb-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        {label}
      </p>
      <p
        className="text-[28px] leading-none"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color,
        }}
      >
        {score}%
      </p>
      {threshold ? (
        <p className="text-[6px] font-futura uppercase mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          THRESHOLD {threshold}%
        </p>
      ) : null}
    </div>
  );
}

type AdminStudioCreativeBarScoreProps = {
  label: string;
  score: number;
};

export function AdminStudioCreativeBarScore({ label, score }: AdminStudioCreativeBarScoreProps) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between items-center">
        <span className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          {label}
        </span>
        <span className="text-[7px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary }}>
          {score}%
        </span>
      </div>
      <div className="h-1.5 bg-black/5 overflow-hidden">
        <div
          className="h-full transition-all duration-500"
          style={{ width: `${score}%`, background: ADMIN_STUDIO_THEME.accent }}
        />
      </div>
    </div>
  );
}
