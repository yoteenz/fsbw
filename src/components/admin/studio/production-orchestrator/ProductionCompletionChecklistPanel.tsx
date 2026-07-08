import {
  PRODUCTION_COMPLETION_CATEGORY_LABELS,
  PRODUCTION_QUALITY_GATE_LABELS,
  type ProductionCompletionCategory,
  type ProductionCompletionChecklist,
  type ProductionChecklistItem,
} from '../../../../studio-os-core/production-completion-system';
import { PRODUCTION_ORCHESTRATOR_ACCENT } from '../../../../studio-os-core/production-orchestrator';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { ExecutiveSecondaryCard } from '../executive-ia';

const CATEGORY_ORDER: ProductionCompletionCategory[] = [
  'architecture',
  'engineering',
  'experience',
  'visual-system',
  'performance',
  'world-integration',
  'qa',
];

type Props = {
  checklist: ProductionCompletionChecklist;
  onToggleItem: (itemId: string, passed: boolean) => void;
  onAdvanceGate: () => void;
  onMarkComplete: () => void;
};

export function ProductionCompletionChecklistPanel({
  checklist,
  onToggleItem,
  onAdvanceGate,
  onMarkComplete,
}: Props) {
  const grouped = CATEGORY_ORDER.map((category) => ({
    category,
    items: checklist.items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);

  return (
    <div className="space-y-3">
      <ExecutiveSecondaryCard title="PRODUCTION BOARD™ · COMPLETION STATUS">
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 mb-2">
          {[
            ['OWNER', checklist.owner],
            ['MODEL', checklist.assignedModel],
            ['STAGE', PRODUCTION_QUALITY_GATE_LABELS[checklist.currentGate]],
            ['COMPLETE', `${checklist.completionPct}%`],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[6px] font-futura uppercase mb-0.5" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                {label}
              </p>
              <p className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textPrimary, fontWeight: 515 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
        <p className="text-[6px] font-futura mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, lineHeight: 1.45 }}>
          {checklist.gateBlocked
            ? `Quality Gate™ paused — ${checklist.blockingLabels.slice(0, 3).join(' · ')}`
            : checklist.readyForReview
              ? 'Ready For Review™ — founder checkpoint unlocked.'
              : 'Required checkpoints on track for current gate.'}
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdvanceGate}
            className="text-[6px] font-futura uppercase border px-2 py-1"
            style={{ borderColor: PRODUCTION_ORCHESTRATOR_ACCENT, color: PRODUCTION_ORCHESTRATOR_ACCENT }}
          >
            ADVANCE QUALITY GATE™
          </button>
          <button
            type="button"
            onClick={onMarkComplete}
            className="text-[6px] font-futura uppercase border px-2 py-1"
            style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            MARK PRODUCTION READY™
          </button>
        </div>
        {checklist.approvedBy ? (
          <p className="text-[6px] font-futura uppercase mt-2" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
            APPROVED BY {checklist.approvedBy}
            {checklist.completionTimestamp ? ` · ${new Date(checklist.completionTimestamp).toLocaleString()}` : ''}
          </p>
        ) : null}
      </ExecutiveSecondaryCard>

      {grouped.map(({ category, items }) => (
        <div
          key={category}
          className="rounded-xl p-3 border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(10, 10, 12, 0.82)' }}
        >
          <p className="text-[6px] font-futura uppercase mb-2" style={{ color: PRODUCTION_ORCHESTRATOR_ACCENT, fontWeight: 515 }}>
            {PRODUCTION_COMPLETION_CATEGORY_LABELS[category]}
          </p>
          <ul className="space-y-1.5">
            {items.map((item: ProductionChecklistItem) => (
              <li key={item.id} className="flex items-start gap-2">
                <button
                  type="button"
                  onClick={() => onToggleItem(item.id, !item.passed)}
                  className="mt-0.5 shrink-0 w-3 h-3 border rounded-sm"
                  style={{
                    borderColor: item.passed ? PRODUCTION_ORCHESTRATOR_ACCENT : ADMIN_STUDIO_THEME.panelBorder,
                    background: item.passed ? 'rgba(168, 85, 247, 0.35)' : 'transparent',
                  }}
                  aria-label={item.label}
                />
                <div>
                  <p
                    className="text-[6px] font-futura"
                    style={{
                      color: item.passed ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary,
                      lineHeight: 1.4,
                      textDecoration: item.passed ? 'line-through' : 'none',
                    }}
                  >
                    {item.required ? '☐ ' : '○ '}
                    {item.label.replace(/^☐ /, '')}
                  </p>
                  <p className="text-[5px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                    {PRODUCTION_QUALITY_GATE_LABELS[item.gateStage]} · {item.required ? 'REQUIRED' : 'OPTIONAL'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
