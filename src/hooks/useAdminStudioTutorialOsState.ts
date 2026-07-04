import { useCallback, useMemo, useState } from 'react';
import {
  buildTutorialOsAnalytics,
  getAdminToursWithOverrides,
  getTutorialOsAchievementsPreview,
  getTutorialOsMissingTargets,
  setTourEnabledInAdmin,
  type TutorialOsSection,
} from '../utils/adminStudioTutorialOsDemo';

export function useAdminStudioTutorialOsState() {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);
  const [section, setSection] = useState<TutorialOsSection>('Tours');

  const tours = useMemo(() => {
    void version;
    return getAdminToursWithOverrides();
  }, [version]);

  const analytics = useMemo(() => {
    void version;
    return buildTutorialOsAnalytics();
  }, [version]);

  const missingTargets = useMemo(() => {
    void version;
    return getTutorialOsMissingTargets();
  }, [version]);

  const achievements = useMemo(() => {
    void version;
    return getTutorialOsAchievementsPreview();
  }, [version]);

  const toggleTourEnabled = useCallback(
    (tourId: string, enabled: boolean) => {
      setTourEnabledInAdmin(tourId, enabled);
      bump();
    },
    [bump]
  );

  return {
    section,
    setSection,
    tours,
    analytics,
    missingTargets,
    achievements,
    toggleTourEnabled,
    refresh: bump,
  };
}
