import {
  MASTER_CONTENT_LIFECYCLE,
} from '../../../../studio-os-core/content-pipeline/lifecycle';
import type { MasterContentLifecycleStageId } from '../../../../studio-os-core/content-pipeline/types';

type Props = {
  activeStageId: MasterContentLifecycleStageId;
  compact?: boolean;
};

/**
 * Compact lifecycle indicator — shows where a Master Content Asset sits in the 17-stage pipeline.
 */
export function MasterContentLifecycleStrip({ activeStageId, compact = false }: Props) {
  const active = MASTER_CONTENT_LIFECYCLE.find((s) => s.id === activeStageId);
  const activeOrder = active?.order ?? 1;

  if (compact) {
    return (
      <div className="mt-2 p-2 border" style={{ borderColor: 'rgba(0,0,0,0.12)', background: 'rgba(255,255,255,0.5)' }}>
        <p className="text-[6px] font-futura uppercase" style={{ fontWeight: 515, color: '#64748B' }}>
          MASTER CONTENT PIPELINE™ · STAGE {String(activeOrder).padStart(2, '0')} / 17
        </p>
        <p className="text-[7px] font-futura uppercase mt-0.5" style={{ fontWeight: 515, color: '#0F172A' }}>
          {active?.label ?? activeStageId}
        </p>
      </div>
    );
  }

  return (
    <div className="mt-2 overflow-x-auto">
      <p className="text-[6px] font-futura uppercase mb-1" style={{ fontWeight: 515, color: '#64748B' }}>
        MASTER CONTENT PIPELINE™
      </p>
      <div className="flex gap-0.5 min-w-max pb-1">
        {MASTER_CONTENT_LIFECYCLE.map((stage) => {
          const isActive = stage.id === activeStageId;
          const isPast = stage.order < activeOrder;
          return (
            <div
              key={stage.id}
              title={stage.description}
              className="px-1 py-0.5 border text-[5px] font-futura uppercase whitespace-nowrap"
              style={{
                fontWeight: 515,
                borderColor: isActive ? '#0F172A' : 'rgba(0,0,0,0.15)',
                background: isActive ? 'rgba(15,23,42,0.08)' : isPast ? 'rgba(34,197,94,0.08)' : 'white',
                color: isActive ? '#0F172A' : isPast ? '#166534' : '#94A3B8',
              }}
            >
              {stage.order}. {stage.shortLabel}
            </div>
          );
        })}
      </div>
    </div>
  );
}
