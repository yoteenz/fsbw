import type { AdminStudioQueueItem } from '../../../utils/adminStudioPublishingQueueDemo';
import { ADMIN_STUDIO_STATUS_COLORS } from '../../../utils/adminStudioPublishingQueueDemo';

type AdminStudioQueueCardProps = {
  item: AdminStudioQueueItem;
  isDragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onStatusChange: (status: AdminStudioQueueItem['status']) => void;
};

/** Draggable publishing queue card — weekly calendar slot. */
export function AdminStudioQueueCard({
  item,
  isDragging,
  onDragStart,
  onDragEnd,
  onStatusChange,
}: AdminStudioQueueCardProps) {
  const statusColor = ADMIN_STUDIO_STATUS_COLORS[item.status];

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', item.id);
        onDragStart();
      }}
      onDragEnd={onDragEnd}
      className="p-2 mb-1.5 cursor-grab active:cursor-grabbing transition-opacity"
      style={{
        opacity: isDragging ? 0.45 : 1,
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderLeft: `2px solid ${item.accentHex}`,
      }}
    >
      <p
        className="text-[7px] leading-tight mb-1 truncate"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#FFFFFF',
        }}
      >
        {item.title}
      </p>
      <p
        className="text-[6px] font-futura uppercase truncate mb-1"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {item.showName} · {item.timeSlot}
      </p>
      <select
        value={item.status}
        onChange={(e) => onStatusChange(e.target.value as AdminStudioQueueItem['status'])}
        onClick={(e) => e.stopPropagation()}
        className="w-full bg-black/40 border-0 text-[6px] font-futura uppercase py-0.5 outline-none"
        style={{ fontWeight: 515, color: statusColor }}
      >
        {(['DRAFT', 'SCHEDULED', 'PUBLISHED', 'NEEDS REVIEW', 'FAILED'] as const).map((s) => (
          <option key={s} value={s} style={{ background: '#121212' }}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}
