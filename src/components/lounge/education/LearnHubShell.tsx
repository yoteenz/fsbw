import type { ReactNode } from 'react';
import { loungeTvGlassCqw } from '../loungeTvResponsive';
import { LOUNGE_TV_TYPE } from '../loungeTvTypography';
import { LoungeTvBackButton } from '../LoungeTvUiPrimitives';
import { LearnSectionTagline, LearnSectionTitle } from './LearnBrowseChrome';

type LearnHubShellProps = {
  title: string;
  tagline?: string;
  onBack: () => void;
  backLabel?: string;
  railId: string;
  children: ReactNode;
};

/** Shared destination shell for Learn content hubs inside Lounge TV. */
export function LearnHubShell({
  title,
  tagline,
  onBack,
  backLabel = '< BACK',
  railId,
  children,
}: LearnHubShellProps) {
  return (
    <div
      className="lounge-tv-learn-hub"
      data-lounge-tv-rail={railId}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.6, 3.6, 7.2),
        width: '100%',
        minWidth: 0,
      }}
    >
      <LoungeTvBackButton
        onClick={onBack}
        label={backLabel}
        fontSize={`calc(${LOUNGE_TV_TYPE.l3} + 1px)`}
      />

      <header className="lounge-tv-learn-hub__header">
        <LearnSectionTitle title={title} />
        {tagline ? (
          <LearnSectionTagline spacingVariant="education">{tagline}</LearnSectionTagline>
        ) : null}
      </header>

      <div className="lounge-tv-learn-hub__body" style={{ width: '100%', minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
}
