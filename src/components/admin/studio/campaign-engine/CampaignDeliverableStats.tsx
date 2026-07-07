import type { CampaignDeliverable, CampaignRecord } from '../../../../studio-os-core/campaign-engine/types';
import { computeDeliverableStats } from '../../../../studio-os-core/campaign-engine/deliverableUtils';
import { ceLabel, cePanel } from './campaignEngineTheme';
import { ceDeskDivider, ceMarblePanel } from './campaignDeliverablesTheme';

type Props = {
  campaign: CampaignRecord;
  deliverables: CampaignDeliverable[];
  onViewDeliverables?: () => void;
  compact?: boolean;
};

export function CampaignDeliverableStats({ campaign, deliverables, onViewDeliverables, compact }: Props) {
  const stats = computeDeliverableStats(deliverables);
  if (stats.total === 0 && compact) return null;

  return (
    <div style={{ marginTop: compact ? 6 : 10 }}>
      {!compact ? <div style={ceDeskDivider} /> : null}
      <p style={{ ...ceLabel, fontSize: '5px', color: '#64748B' }}>
        {campaign.name.split('·')[0]?.trim() ?? campaign.name}
        {campaign.name.includes('·') ? ` · ${campaign.name.split('·').slice(1).join('·').trim()}` : ''}
      </p>
      {stats.total > 0 ? (
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
          <span style={{ ...ceLabel, fontSize: '8px', fontFamily: '"Futura PT Medium"', color: '#0F172A' }}>
            {stats.total} DELIVERABLE{stats.total === 1 ? '' : 'S'}
          </span>
          {stats.complete > 0 ? (
            <span style={{ ...ceLabel, fontSize: '7px', color: '#16A34A' }}>{stats.complete} COMPLETE</span>
          ) : null}
          {stats.inReview > 0 ? (
            <span style={{ ...ceLabel, fontSize: '7px', color: '#D97706' }}>{stats.inReview} IN REVIEW</span>
          ) : null}
          {stats.draft > 0 ? (
            <span style={{ ...ceLabel, fontSize: '7px', color: '#808080' }}>{stats.draft} DRAFT</span>
          ) : null}
          {stats.scheduled > 0 ? (
            <span style={{ ...ceLabel, fontSize: '7px', color: '#0891B2' }}>{stats.scheduled} SCHEDULED</span>
          ) : null}
        </div>
      ) : (
        <p style={{ ...ceLabel, fontSize: '5px', marginTop: 4 }}>NO DELIVERABLES YET · ADD IN CAMPAIGN WORKSPACE</p>
      )}
      {onViewDeliverables && stats.total > 0 ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onViewDeliverables();
          }}
          className="mt-2 text-[8px] font-futura"
          style={{
            fontWeight: 515,
            color: '#D97706',
            fontFamily: '"Futura PT Medium"',
            letterSpacing: '0.06em',
          }}
        >
          VIEW DELIVERABLES →
        </button>
      ) : null}
    </div>
  );
}

export function CampaignDeliverableStatsPanel({ deliverables }: Pick<Props, 'deliverables'>) {
  const stats = computeDeliverableStats(deliverables);
  return (
    <section className="p-3 mb-3" style={ceMarblePanel}>
      <p style={{ ...ceLabel, fontSize: '5px', letterSpacing: '0.1em' }}>DELIVERABLES MANAGER™ · PRODUCTION DESK</p>
      <div className="grid grid-cols-2 gap-2 mt-2 sm:grid-cols-4">
        {(
          [
            ['TOTAL', stats.total],
            ['COMPLETE', stats.complete],
            ['IN REVIEW', stats.inReview],
            ['DRAFT', stats.draft],
            ['SCHEDULED', stats.scheduled],
            ['APPROVED', stats.approved],
            ['PUBLISHED', stats.published],
            ['LEARNING', stats.learning],
          ] as [string, number][]
        )
          .filter(([, val]) => val > 0 || stats.total === 0)
          .slice(0, 8)
          .map(([label, val]) => (
            <div key={label} className="p-2 text-center" style={{ ...cePanel, background: 'rgba(255,255,255,0.7)' }}>
              <p className="text-[8px] font-futura" style={{ fontWeight: 515, color: '#0F172A' }}>
                {val}
              </p>
              <p style={{ ...ceLabel, fontSize: '4px' }}>{label}</p>
            </div>
          ))}
      </div>
    </section>
  );
}
