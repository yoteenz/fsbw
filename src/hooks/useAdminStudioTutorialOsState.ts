import { useCallback, useMemo, useState } from 'react';
import {
  buildTutorialOsAnalytics,
  getAdminToursWithOverrides,
  getTutorialOsAchievementsPreview,
  getTutorialOsAnimations,
  getTutorialOsCopyLibrary,
  getTutorialOsFeatures,
  getTutorialOsMissingTargets,
  getTutorialOsPages,
  getTutorialOsRouteValidation,
  getTutorialOsSearchIndexPreview,
  getTutorialOsUserProgress,
  getTutorialOsWidgets,
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

  const pages = useMemo(() => getTutorialOsPages(), []);
  const features = useMemo(() => getTutorialOsFeatures(), [version, tours]);
  const widgets = useMemo(() => getTutorialOsWidgets(), [version, tours]);
  const animations = useMemo(() => getTutorialOsAnimations(), [version, tours]);
  const searchIndex = useMemo(() => getTutorialOsSearchIndexPreview(), [version, tours]);
  const userProgress = useMemo(() => {
    void version;
    return getTutorialOsUserProgress();
  }, [version]);
  const routeValidation = useMemo(() => getTutorialOsRouteValidation(), []);
  const copyLibrary = useMemo(() => getTutorialOsCopyLibrary(), [version, tours]);

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
    pages,
    features,
    widgets,
    animations,
    searchIndex,
    userProgress,
    routeValidation,
    copyLibrary,
    refresh: bump,
  };
}
