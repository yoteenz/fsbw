import { useEffect, useMemo, useRef } from 'react';
import {
  ensureExperienceEngineDnaSubsystem,
  resolveExperienceProfile,
  type XeePlaygroundSelection,
} from '../studio-os-core/genesis';

/** Apply layered Experience DNA to a scene root — no hardcoded brand styles. */
export function useExperienceInheritance(playground?: Partial<XeePlaygroundSelection>) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureExperienceEngineDnaSubsystem();
  }, []);

  const profile = useMemo(
    () =>
      resolveExperienceProfile({
        brandId: playground?.brandId,
        departmentId: playground?.departmentId,
        sceneId: playground?.sceneId,
        motionDnaId: playground?.motionDnaId,
      }),
    [playground?.brandId, playground?.departmentId, playground?.sceneId, playground?.motionDnaId]
  );

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (const [key, value] of Object.entries(profile.cssVariables)) {
      el.style.setProperty(key, value);
    }
    el.setAttribute('data-xee-scene', profile.scene.sceneId);
    el.setAttribute('data-xee-brand', profile.brandId);
    el.setAttribute('data-xee-department', profile.departmentId);
  }, [profile]);

  return { ref, profile };
}
