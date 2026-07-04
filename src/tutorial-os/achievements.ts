/** Placeholder badges — wired for future rewards integration. */

export type TutorialAchievement = {
  id: string;
  label: string;
  description: string;
  tourId: string;
};

export const TUTORIAL_ACHIEVEMENTS: readonly TutorialAchievement[] = [
  {
    id: 'explorer-badge',
    label: 'Explorer Badge',
    description: 'Completed The Mansion Tour — discovered every corner of Frontal Slayer.',
    tourId: 'mansion-tour',
  },
  {
    id: 'builder-badge',
    label: 'Builder Badge',
    description: 'Completed the Build-A-Wig Tour — mastered customization.',
    tourId: 'build-a-wig-tour',
  },
  {
    id: 'collector-badge',
    label: 'Collector Badge',
    description: 'Completed the Rewards Tour — unlocked loyalty mastery.',
    tourId: 'rewards-tour',
  },
] as const;

export function getAchievementForTour(tourId: string): TutorialAchievement | undefined {
  return TUTORIAL_ACHIEVEMENTS.find((a) => a.tourId === tourId);
}
