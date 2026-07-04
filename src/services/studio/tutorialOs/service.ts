import { type StudioServiceResult, type StudioServiceStub } from '../types';
import {
  buildTutorialOsAnalytics,
  getAdminToursWithOverrides,
  TUTORIAL_OS_SUBTITLE,
} from '../../../utils/adminStudioTutorialOsDemo';

export type TutorialOsSnapshot = {
  subtitle: string;
  tourCount: number;
  enabledCount: number;
  analytics: ReturnType<typeof buildTutorialOsAnalytics>;
};

export const tutorialOsStudioService: StudioServiceStub & {
  getSnapshot(): Promise<StudioServiceResult<TutorialOsSnapshot>>;
} = {
  id: 'tutorial-os',
  label: 'TUTORIAL OS',
  phase: 2,
  enabled: true,
  description: TUTORIAL_OS_SUBTITLE,
  async getSnapshot() {
    const tours = getAdminToursWithOverrides();
    return {
      ok: true,
      data: {
        subtitle: TUTORIAL_OS_SUBTITLE,
        tourCount: tours.length,
        enabledCount: tours.filter((t) => t.status === 'enabled').length,
        analytics: buildTutorialOsAnalytics(),
      },
    };
  },
};
