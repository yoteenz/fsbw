import { useEffect, useMemo, useRef } from 'react';
import {
  ensureStudioOsDesignDnaSubsystem,
  resolveDesignDnaSceneProfile,
  type DdnaSceneProfile,
} from '../studio-os-core/genesis';

/**
 * Every new Studio OS scene should call this hook on its root container
 * to inherit Design DNA CSS variables automatically.
 */
export function useDesignDnaSceneInheritance(departmentId?: string): {
  ref: React.RefObject<HTMLDivElement | null>;
  profile: DdnaSceneProfile;
} {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    ensureStudioOsDesignDnaSubsystem();
  }, []);

  const profile = useMemo(() => resolveDesignDnaSceneProfile(departmentId), [departmentId]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (const [key, value] of Object.entries(profile.cssVariables)) {
      el.style.setProperty(key, value);
    }
    el.setAttribute('data-ddna-scene', profile.sceneTemplate.templateId);
    el.setAttribute('data-ddna-department', profile.departmentId);
  }, [profile]);

  return { ref, profile };
}
