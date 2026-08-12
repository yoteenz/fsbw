import type { ReactNode } from 'react';
import { loungeTvGlassCqw } from '../../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../../loungeTvTypography';
import { LoungeTvBackButton } from '../../LoungeTvUiPrimitives';
import { LearnSectionTagline, LearnSectionTitle } from '../../education/LearnBrowseChrome';

type SlayForecastHubShellProps = {
  title?: string;
  tagline?: string;
  onBack: () => void;
  backLabel?: string;
  railId: string;
  children: ReactNode;
};

/** Dedicated Slay Forecast destination shell inside Lounge TV. */
export function SlayForecastHubShell({
  title = 'SLAY FORECAST',
  tagline = "WHAT'S NEXT IN HAIR, BEFORE IT HITS.",
  onBack,
  backLabel = '< BACK',
  railId,
  children,
}: SlayForecastHubShellProps) {
  return (
    <div
      className="lounge-tv-slay-forecast-hub"
      data-lounge-tv-rail={railId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.4, 3.2, 6.4),
        width: '100%',
        minWidth: 0,
      }}
    >
      <LoungeTvBackButton
        onClick={onBack}
        label={backLabel}
        fontSize={`calc(${LOUNGE_TV_TYPE.l3} + 1px)`}
      />
      <header className="lounge-tv-slay-forecast-hub__header">
        <LearnSectionTitle title={title} />
        {tagline ? (
          <LearnSectionTagline spacingVariant="education">{tagline}</LearnSectionTagline>
        ) : null}
      </header>
      <div className="lounge-tv-slay-forecast-hub__body" style={{ width: '100%', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
