import type { StudioOsBrandSystemId } from '../../../../studio-os-core/brand-positioning';
import { formatBrandHeader, STUDIO_OS_OFFICIAL_TAGLINE } from '../../../../studio-os-core/brand-positioning';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type StudioOsBrandTaglineProps = {
  systemId: StudioOsBrandSystemId;
  /** Show contextual voice below master tagline. Default true. */
  showContextual?: boolean;
  className?: string;
};

/** Permanent Studio OS brand promise — Milestone 92. */
export function StudioOsBrandTagline({
  systemId,
  showContextual = true,
  className = '',
}: StudioOsBrandTaglineProps) {
  const { officialTagline, contextualVoice } = formatBrandHeader(systemId);
  const showBoth = showContextual && contextualVoice !== STUDIO_OS_OFFICIAL_TAGLINE;

  return (
    <div className={`mb-3 ${className}`}>
      <p
        className="text-[7px] font-futura uppercase tracking-wide"
        style={{ fontWeight: 515, color: '#92704A', letterSpacing: '0.14em' }}
      >
        {officialTagline}
      </p>
      {showBoth ? (
        <p
          className="text-[6px] font-futura normal-case mt-1"
          style={{ color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.45 }}
        >
          {contextualVoice}
        </p>
      ) : null}
    </div>
  );
}
