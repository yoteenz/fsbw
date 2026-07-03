import type { DragEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioQueueCard } from '../../../../components/admin/studio/AdminStudioQueueCard';
import { useAdminStudioPublishingQueue } from '../../../../hooks/useAdminStudioPublishingQueueState';
import {
  ADMIN_STUDIO_PUBLISH_STATUSES,
  ADMIN_STUDIO_QUEUE_WEEK_LABEL,
  type AdminStudioQueueDayId,
  type AdminStudioPublishStatus,
} from '../../../../utils/adminStudioPublishingQueueDemo';

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

  return (
    <AdminStudioStageShell
      title="PUBLISHING QUEUE"
      subtitle="WEEKLY RELEASE CALENDAR — DRAG TO RESCHEDULE"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <p
        className="text-lg mb-1"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#EB1C24',
        }}
      >
        RELEASE CALENDAR
      </p>
      <p
        className="text-[8px] font-futura uppercase mb-4"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        {ADMIN_STUDIO_QUEUE_WEEK_LABEL}
      </p>

      <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'thin' }}>
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className="flex-shrink-0 px-2 py-1 text-[7px] font-futura uppercase"
          style={{
            fontWeight: 515,
            color: statusFilter === 'all' ? '#FFFFFF' : '#9A9A9A',
            background: statusFilter === 'all' ? 'rgba(235,28,36,0.25)' : 'rgba(255,255,255,0.04)',
            borderBottom: statusFilter === 'all' ? '2px solid #EB1C24' : '2px solid transparent',
          }}
        >
          ALL ({items.length})
        </button>
        {ADMIN_STUDIO_PUBLISH_STATUSES.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status as AdminStudioPublishStatus)}
            className="flex-shrink-0 px-2 py-1 text-[6px] font-futura uppercase whitespace-nowrap"
            style={{
              fontWeight: 515,
              color: statusFilter === status ? '#FFFFFF' : '#9A9A9A',
              background: statusFilter === status ? 'rgba(235,28,36,0.25)' : 'rgba(255,255,255,0.04)',
              borderBottom: statusFilter === status ? '2px solid #EB1C24' : '2px solid transparent',
            }}
          >
            {status}
          </button>
        ))}
      </div>

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
                className="flex-shrink-0 w-[88px] min-h-[200px] p-1.5 transition-colors"
                style={{
                  background: isToday ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.03)',
                  border: isToday ? '1px solid #EB1C2433' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="mb-2 text-center">
                  <p
                    className="text-[8px] font-futura uppercase"
                    style={{ fontWeight: 515, color: isToday ? '#EB1C24' : '#FFFFFF' }}
                  >
                    {day.label}
                  </p>
                  <p
                    className="text-[6px] font-futura uppercase"
                    style={{ fontWeight: 515, color: '#9A9A9A' }}
                  >
                    {day.dateLabel}
                  </p>
                </div>
                {dayItems.length === 0 ? (
                  <p
                    className="text-[6px] font-futura uppercase text-center py-4"
                    style={{ fontWeight: 515, color: '#9A9A9A', opacity: 0.6 }}
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

      <p
        className="mt-4 text-[7px] font-futura uppercase text-center"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        DRAG CARDS BETWEEN DAYS · NO PUBLISHING · SAVED LOCALLY
      </p>
    </AdminStudioStageShell>
  );
}
