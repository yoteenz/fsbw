import type { CampaignDeliverable, CampaignRecord } from '../../../../studio-os-core/campaign-engine/types';
import { workflowStatusLabel } from '../../../../studio-os-core/campaign-engine/deliverableUtils';
import { ceLabel, ceSectionTitle } from './campaignEngineTheme';
import {
  ceDeliverablesDeskTitle,
  ceDeskDivider,
  ceGlassStrip,
  ceMarblePanel,
  workflowStatusBadgeStyle,
} from './campaignDeliverablesTheme';

type Props = {
  campaign: CampaignRecord;
  deliverables: CampaignDeliverable[];
  selectedDeliverableId: string | null;
  onSelectDeliverable: (id: string) => void;
};

function formatDue(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

function formatUpdated(iso: string): string {
  try {
    const d = new Date(iso);
    const diff = Date.now() - d.getTime();
    if (diff < 86400000) return 'Today';
    if (diff < 172800000) return 'Yesterday';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch {
    return iso;
  }
}

export function DeliverablesManagerPanel({
  campaign,
  deliverables,
  selectedDeliverableId,
  onSelectDeliverable,
}: Props) {
  const sorted = [...deliverables].sort((a, b) => {
    const order = ['review', 'draft', 'approved', 'scheduled', 'published', 'learning'];
    return order.indexOf(a.workflowStatus) - order.indexOf(b.workflowStatus);
  });

  return (
    <section className="p-4 mb-3" style={ceMarblePanel}>
      <p style={ceDeliverablesDeskTitle}>Deliverables Manager™</p>
      <p style={{ ...ceLabel, fontSize: '6px', marginBottom: 12 }}>
        {campaign.name} · review every asset · open in Newsroom Editor™
      </p>
      <div style={ceDeskDivider} />

      {sorted.length === 0 ? (
        <p style={ceLabel}>No deliverables yet · Campaign Builder step 10 defines the asset list.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((del) => {
            const active = selectedDeliverableId === del.id;
            return (
              <button
                key={del.id}
                type="button"
                onClick={() => onSelectDeliverable(del.id)}
                className="w-full text-left p-3 transition-opacity"
                style={{
                  ...ceGlassStrip,
                  borderLeft: active ? '3px solid #D97706' : '3px solid transparent',
                  opacity: active ? 1 : 0.98,
                }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-[8px] font-futura truncate" style={{ fontWeight: 515, color: '#0F172A' }}>
                      {del.title}
                    </p>
                    <p style={{ ...ceLabel, fontSize: '5px', marginTop: 2 }}>
                      {(del.format ?? del.type).replace(/-/g, ' ').toUpperCase()} · {del.platform.toUpperCase()}
                    </p>
                  </div>
                  <span style={workflowStatusBadgeStyle(del.workflowStatus)}>
                    {workflowStatusLabel(del.workflowStatus)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-3 sm:grid-cols-4">
                  {[
                    ['OWNER', del.owner],
                    ['DUE', formatDue(del.dueAt)],
                    ['APPROVAL', del.approvalStatus.replace(/-/g, ' ').toUpperCase()],
                    ['PUBLISHING', del.publishingStatus.toUpperCase()],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ ...ceLabel, fontSize: '4px' }}>{label}</p>
                      <p className="text-[5px] font-futura truncate" style={{ fontWeight: 515, color: '#334155' }}>
                        {val}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2" style={{ borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                  <p style={{ ...ceLabel, fontSize: '4px' }}>UPDATED {formatUpdated(del.updatedAt)}</p>
                  <span style={{ ...ceSectionTitle, fontSize: '5px', margin: 0, color: '#D97706' }}>
                    OPEN IN NEWSROOM EDITOR™ →
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <div className="mt-4 p-2" style={{ ...ceGlassStrip, background: 'rgba(255,255,255,0.35)' }}>
        <p style={{ ...ceLabel, fontSize: '5px' }}>
          STATE ENGINE™ · DRAFT → REVIEW → APPROVED → SCHEDULED → PUBLISHED → LEARNING
        </p>
        <p style={{ ...ceLabel, fontSize: '5px', marginTop: 4 }}>
          Published deliverables become Knowledge Library™ assets · Studio Intelligence™ learns from performance.
        </p>
      </div>
    </section>
  );
}
