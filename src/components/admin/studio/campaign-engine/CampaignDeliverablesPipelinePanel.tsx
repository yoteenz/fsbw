import type { CampaignDeliverable, CampaignRecord } from '../../../../studio-os-core/campaign-engine/types';
import { computeDeliverableStats } from '../../../../studio-os-core/campaign-engine/deliverableUtils';
import { ceLabel, ceSectionTitle, CE } from './campaignEngineTheme';
import { ceDeliverablesDeskTitle, ceMarblePanel } from './campaignDeliverablesTheme';

type Props = {
  deliverables: CampaignDeliverable[];
  campaigns: CampaignRecord[];
  selectedCampaign: CampaignRecord | null;
  onOpenDeliverables: (campaignId: string) => void;
};

export function CampaignDeliverablesPipelinePanel({
  deliverables,
  campaigns,
  selectedCampaign,
  onOpenDeliverables,
}: Props) {
  const stats = computeDeliverableStats(deliverables);
  const featured =
    selectedCampaign ??
    campaigns.find((c) => c.id === 'camp-truth-tuesday') ??
    campaigns.find((c) => deliverables.some((d) => d.campaignId === c.id)) ??
    campaigns[0] ??
    null;

  const featuredDeliverables = featured
    ? deliverables.filter((d) => d.campaignId === featured.id)
    : deliverables;
  const featuredStats = computeDeliverableStats(featuredDeliverables);

  if (deliverables.length === 0) {
    const hasOtherWorkspaceAssets = campaigns.length === 0;
    return (
      <section className="p-4 mb-3" style={{ ...ceMarblePanel, borderLeft: `4px solid ${CE.amber}` }}>
        <p style={ceDeliverablesDeskTitle}>Deliverables Manager™</p>
        <p style={{ ...ceLabel, fontSize: '8px' }}>
          {hasOtherWorkspaceAssets
            ? 'No deliverables in this workspace yet.'
            : 'No deliverables loaded — tap NDXBOOK above, then OPEN DELIVERABLES MANAGER™.'}
        </p>
        <p style={{ ...ceLabel, fontSize: '7px', marginTop: 6 }}>
          Truth Tuesday · Fact-Forward Cadence includes 12 sample assets (pages, social, scripts, newsletter).
        </p>
      </section>
    );
  }

  return (
    <section className="p-4 mb-3" style={{ ...ceMarblePanel, borderLeft: `4px solid ${CE.amber}` }}>
      <p style={ceDeliverablesDeskTitle}>Deliverables Manager™</p>
      <p style={{ ...ceLabel, fontSize: '8px', marginBottom: 12 }}>
        Where campaign content is reviewed, edited, approved, and published — not the executive strategy view.
      </p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mb-3">
        {[
          ['TOTAL ASSETS', stats.total],
          ['IN REVIEW', stats.inReview],
          ['DRAFT', stats.draft],
          ['COMPLETE', stats.complete],
        ].map(([label, val]) => (
          <div key={label} className="p-2 text-center border" style={{ borderColor: CE.panelBorder, background: 'rgba(255,255,255,0.65)' }}>
            <p className="text-[11px] font-futura" style={{ fontWeight: 515, color: '#0F172A' }}>
              {val}
            </p>
            <p style={{ ...ceLabel, fontSize: '6px' }}>{label}</p>
          </div>
        ))}
      </div>

      {featured ? (
        <div className="p-3 border" style={{ borderColor: CE.amber, background: 'rgba(217,119,6,0.05)' }}>
          <p style={{ ...ceSectionTitle, fontSize: '8px' }}>FEATURED CAMPAIGN · CONTENT PIPELINE</p>
          <p className="text-[9px] font-futura mt-1" style={{ fontWeight: 515 }}>
            {featured.name}
          </p>
          <p style={{ ...ceLabel, fontSize: '7px', marginTop: 4 }}>
            {featuredStats.total} deliverables · {featuredStats.inReview} in review · {featuredStats.draft} draft ·{' '}
            {featuredStats.scheduled} scheduled
          </p>
          <ul className="mt-2 space-y-1">
            {featuredDeliverables.slice(0, 4).map((del) => (
              <li key={del.id} className="text-[8px] font-futura flex justify-between gap-2" style={{ fontWeight: 515 }}>
                <span className="truncate">{del.title}</span>
                <span style={{ color: '#D97706', fontSize: '7px', flexShrink: 0 }}>{del.workflowStatus.toUpperCase()}</span>
              </li>
            ))}
          </ul>
          {featuredDeliverables.length > 4 ? (
            <p style={{ ...ceLabel, fontSize: '6px', marginTop: 4 }}>+ {featuredDeliverables.length - 4} more assets</p>
          ) : null}
          <button
            type="button"
            onClick={() => onOpenDeliverables(featured.id)}
            className="mt-3 px-3 py-2 text-[8px] font-futura border w-full sm:w-auto"
            style={{
              fontWeight: 515,
              borderColor: CE.amber,
              color: CE.amber,
              background: 'white',
              fontFamily: '"Futura PT Medium"',
            }}
          >
            OPEN DELIVERABLES MANAGER™ →
          </button>
        </div>
      ) : null}
    </section>
  );
}
