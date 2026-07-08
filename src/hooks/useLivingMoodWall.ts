import { useCallback, useMemo, useState } from 'react';
import {
  addMoodWallAiSuggestion,
  addMoodWallInspiration,
  getLivingMoodWall,
  removeMoodWallInspiration,
  reorderMoodWallInspirations,
} from '../studio-os-core/studio-objects/living-mood-wall';

export function useLivingMoodWall(departmentId: string, projectId: string) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const wall = useMemo(() => {
    void version;
    return getLivingMoodWall(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const addInspiration = useCallback(
    (input: { title: string; sourceType: string; url: string; note?: string }) => {
      const item = addMoodWallInspiration(departmentId, projectId, input);
      addMoodWallAiSuggestion(departmentId, projectId, {
        summary: `Studio Intelligence analyzed "${input.title}" — editorial direction refreshed.`,
        concepts: [
          'Increase negative space on hero wall',
          'Warm key light on brass accents',
          'Editorial crop — ceremony weight',
        ],
      });
      bump();
      return item;
    },
    [bump, departmentId, projectId]
  );

  const removeInspiration = useCallback(
    (id: string) => {
      removeMoodWallInspiration(departmentId, projectId, id);
      bump();
    },
    [bump, departmentId, projectId]
  );

  const moveInspiration = useCallback(
    (fromIndex: number, toIndex: number) => {
      const ids = [...wall.inspirations].sort((a, b) => a.order - b.order).map((i) => i.id);
      const [moved] = ids.splice(fromIndex, 1);
      ids.splice(toIndex, 0, moved);
      reorderMoodWallInspirations(departmentId, projectId, ids);
      bump();
    },
    [bump, departmentId, projectId, wall.inspirations]
  );

  return { wall, addInspiration, removeInspiration, moveInspiration, bump };
}
