import type { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioQueueCard } from '../../../../components/admin/studio/AdminStudioQueueCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioFilterBar } from '../../../../components/admin/studio/AdminStudioFilterBar';
import { AdminStudioDisclaimerFooter } from '../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioPublishingQueue } from '../../../../hooks/useAdminStudioPublishingQueueState';
import {
  ADMIN_STUDIO_PUBLISH_STATUSES,
  ADMIN_STUDIO_QUEUE_WEEK_LABEL,
  type AdminStudioQueueDayId,
  type AdminStudioPublishStatus,
} from '../../../../utils/adminStudioPublishingQueueDemo';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioPublishingQueuePage() {
  const navigate = useNavigate();
  const {
    itemsByDay,
    days,
    draggedId,
    statusFilter,
    setStatusFilter,
    updateItemStatus,
    onDragStart,
    onDragEnd,
    onDropOnDay,
    items,
  } = useAdminStudioPublishingQueue();

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (dayId: AdminStudioQueueDayId) => (e: DragEvent) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) onDropOnDay(dayId, id);
  };

  const filterItems: Array<{ id: AdminStudioPublishStatus | 'all'; label: string }> = [
    { id: 'all', label: `ALL (${items.length})` },
    ...ADMIN_STUDIO_PUBLISH_STATUSES.map((s) => ({ id: s, label: s })),
  ];

  return (
    <AdminStudioStageShell
      title="PUBLISHING QUEUE"
      subtitle="WEEKLY RELEASE CALENDAR — DRAG TO RESCHEDULE"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioSectionHeading>RELEASE CALENDAR</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-4 -mt-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
      >
        {ADMIN_STUDIO_QUEUE_WEEK_LABEL}
      </p>

      <AdminStudioFilterBar
        items={filterItems}
        activeId={statusFilter}
        onChange={setStatusFilter}
      />

      <div className="overflow-x-auto -mx-1 px-1 pb-2" style={{ scrollbarWidth: 'thin' }}>
        <div className="flex gap-2 min-w-max">
          {days.map((day) => {
            const dayItems = itemsByDay[day.id] ?? [];
            const isToday = day.id === 'thu';
            return (
              <div
                key={day.id}
                onDragOver={handleDragOver}
                onDrop={handleDrop(day.id)}
                className="flex-shrink-0 w-[88px] min-h-[200px] p-1.5 transition-colors border bg-white/60"
                style={{
                  background: isToday ? ADMIN_STUDIO_THEME.selectedBg : ADMIN_STUDIO_THEME.panelBg,
                  borderColor: isToday ? `${ADMIN_STUDIO_THEME.accent}44` : ADMIN_STUDIO_THEME.panelBorder,
                }}
              >
                <div className="mb-2 text-center">
                  <p
                    className="text-[8px] font-futura uppercase"
                    style={{ fontWeight: 515, color: isToday ? ADMIN_STUDIO_THEME.accent : ADMIN_STUDIO_THEME.textPrimary }}
                  >
                    {day.label}
                  </p>
                  <p
                    className="text-[6px] font-futura uppercase"
                    style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
                  >
                    {day.dateLabel}
                  </p>
                </div>
                {dayItems.length === 0 ? (
                  <p
                    className="text-[6px] font-futura uppercase text-center py-4"
                    style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, opacity: 0.6 }}
                  >
                    DROP HERE
                  </p>
                ) : (
                  dayItems.map((item) => (
                    <AdminStudioQueueCard
                      key={item.id}
                      item={item}
                      isDragging={draggedId === item.id}
                      onDragStart={() => onDragStart(item.id)}
                      onDragEnd={onDragEnd}
                      onStatusChange={(status) => updateItemStatus(item.id, status)}
                    />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>

      <AdminStudioDisclaimerFooter>DRAG CARDS BETWEEN DAYS · NO PUBLISHING · SAVED LOCALLY</AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}
