import { CEREMONY_STAGES } from '../constants';
import type { CeremonyStageDefinition, CeremonyTemplate } from './schema';

const STAGE_DEFS: CeremonyStageDefinition[] = [
  {
    id: 'graduation-stage',
    label: 'Graduation Stage',
    narrativeBeat: 'The profession welcomes the citizen onto the graduation stage.',
    durationSeconds: 45,
  },
  {
    id: 'mentor-dialogue',
    label: 'Mentor Dialogue',
    narrativeBeat: 'A master mentor speaks to the achievement and the road ahead.',
    durationSeconds: 60,
  },
  {
    id: 'crystal-credential',
    label: 'Crystal Credential Presentation',
    narrativeBeat: 'The crystal credential is presented — not downloaded.',
    durationSeconds: 30,
  },
  {
    id: 'community-celebration',
    label: 'Community Celebration',
    narrativeBeat: 'Peers, guilds, and the Career World celebrate the milestone.',
    durationSeconds: 40,
  },
  {
    id: 'achievement-recording',
    label: 'Achievement Recording',
    narrativeBeat: 'The achievement is recorded in career history and Exchange records.',
    durationSeconds: 20,
  },
  {
    id: 'professional-memory',
    label: 'Professional Memory Integration',
    narrativeBeat: 'Mastery becomes Professional Memory™ inside the living world.',
    durationSeconds: 25,
  },
];

export const CEREMONY_TEMPLATES: CeremonyTemplate[] = [
  {
    id: 'graduation-standard',
    displayName: 'Standard Graduation Ceremony™',
    stages: STAGE_DEFS.filter((s) => CEREMONY_STAGES.includes(s.id)),
  },
  {
    id: 'graduation-master',
    displayName: 'Master Graduation Ceremony™',
    stages: STAGE_DEFS,
  },
];

export function getCeremonyTemplate(templateId: string): CeremonyTemplate | null {
  return CEREMONY_TEMPLATES.find((t) => t.id === templateId) ?? null;
}
