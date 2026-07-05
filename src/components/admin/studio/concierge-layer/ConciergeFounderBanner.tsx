import type { ConciergeId } from '../../../../studio-os-core/concierge-layer/types';
import { getConciergeById } from '../../../../studio-os-core/concierge-layer/mapping';
import { CL, clLabel, clPanel, clSectionTitle } from './conciergeLayerTheme';

type Props = {
  conciergeId: ConciergeId;
  compact?: boolean;
};

/** Founder-facing concierge banner — executive organization unchanged beneath. */
export function ConciergeFounderBanner({ conciergeId, compact = false }: Props) {
  const c = getConciergeById(conciergeId);
  return (
    <section
      className="p-3 mb-3"
      style={{
        ...clPanel,
        borderLeft: `4px solid ${CL.champagne}`,
        background: CL.missionBg,
      }}
    >
      <p style={clSectionTitle}>CONCIERGE EXPERIENCE · {c.conciergeTitle.toUpperCase()}</p>
      {!compact && <p style={{ ...clLabel, color: CL.champagne, fontStyle: 'italic' }}>{c.tagline}</p>}
      <p style={{ ...clLabel, fontSize: '6px', marginTop: compact ? 0 : 6 }}>
        <span style={{ color: CL.slate }}>Represents:</span>{' '}
        <span style={{ color: CL.champagne, fontFamily: '"Futura PT Medium"' }}>{c.representsExecutive}</span>
        {' · '}
        <span style={{ color: CL.slate }}>Governance unchanged · experience layer only</span>
      </p>
    </section>
  );
}
