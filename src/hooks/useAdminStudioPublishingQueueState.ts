import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_DEFAULT_QUEUE_ITEMS,
  ADMIN_STUDIO_QUEUE_DAYS,
  type AdminStudioQueueDayId,
  type AdminStudioQueueItem,
  type AdminStudioPublishStatus,
} from '../utils/adminStudioPublishingQueueDemo';

const STORAGE_KEY = 'adminStudioPublishingQueue_v1';

function readItems(): AdminStudioQueueItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return ADMIN_STUDIO_DEFAULT_QUEUE_ITEMS.map((i) => ({ ...i }));
    const parsed = JSON.parse(raw) as AdminStudioQueueItem[];
    return parsed.map((i) => ({ ...i }));
  } catch {
    return ADMIN_STUDIO_DEFAULT_QUEUE_ITEMS.map((i) => ({ ...i }));
  }
}

function writeItems(items: AdminStudioQueueItem[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useAdminStudioPublishingQueue() {
  const [items, setItems] = useState<AdminStudioQueueItem[]>(readItems);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<AdminStudioPublishStatus | 'all'>('all');

  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return items;
    return items.filter((i) => i.status === statusFilter);
  }, [items, statusFilter]);

  const itemsByDay = useMemo(() => {
    const map = Object.fromEntries(
      ADMIN_STUDIO_QUEUE_DAYS.map((d) => [d.id, [] as AdminStudioQueueItem[]])
    ) as Record<AdminStudioQueueDayId, AdminStudioQueueItem[]>;
    for (const item of filteredItems) {
      map[item.dayId]?.push(item);
    }
    return map;
  }, [filteredItems]);

  const moveItemToDay = useCallback((itemId: string, dayId: AdminStudioQueueDayId) => {
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === itemId ? { ...item, dayId, status: item.status === 'PUBLISHED' ? item.status : 'SCHEDULED' as const } : item
      );
      writeItems(next);
      return next;
    });
  }, []);

  const updateItemStatus = useCallback((itemId: string, status: AdminStudioPublishStatus) => {
    setItems((prev) => {
      const next = prev.map((item) => (item.id === itemId ? { ...item, status } : item));
      writeItems(next);
      return next;
    });
  }, []);

  const onDragStart = useCallback((itemId: string) => {
    setDraggedId(itemId);
  }, []);

  const onDragEnd = useCallback(() => {
    setDraggedId(null);
  }, []);

  const onDropOnDay = useCallback(
    (dayId: AdminStudioQueueDayId, itemId?: string) => {
      const id = itemId ?? draggedId;
      if (!id) return;
      moveItemToDay(id, dayId);
      setDraggedId(null);
    },
    [draggedId, moveItemToDay]
  );

  return {
    items: filteredItems,
    itemsByDay,
    days: ADMIN_STUDIO_QUEUE_DAYS,
    draggedId,
    statusFilter,
    setStatusFilter,
    moveItemToDay,
    updateItemStatus,
    onDragStart,
    onDragEnd,
    onDropOnDay,
  };
}
