/** Experience Studio™ — conversational experience builder session (UI layer on Digital Architect). */

export type ExperienceStudioPhase = 'entry' | 'interview' | 'builder';

export type InterviewStep = 'style' | 'audience' | 'feeling';

export type ExperienceTypeId =
  | 'website'
  | 'landing-page'
  | 'store'
  | 'mobile-app'
  | 'desktop-app'
  | 'client-portal'
  | 'dashboard'
  | 'academy'
  | 'marketplace'
  | 'booking'
  | 'interactive'
  | 'internal-tool'
  | 'custom';

export type ExperienceDnaSliders = {
  motion: number;
  lighting: number;
  depth: number;
  glass: number;
  storytelling: number;
  navigation: number;
  interaction: number;
  animation: number;
  transitions: number;
  density: number;
};

export type StudioPanelId = 'none' | 'design-dna' | 'experience-dna' | 'director' | 'remix';

export type CreativeDirectorCritique = {
  id: string;
  message: string;
  why: string;
  severity: 'note' | 'attention' | 'critical';
};

export type DesignHealthCategory = {
  id: string;
  label: string;
  score: number;
  note: string;
};

export type ExperienceStudioSession = {
  version: string;
  phase: ExperienceStudioPhase;
  interviewStep: InterviewStep;
  experienceType: ExperienceTypeId | null;
  styleChoice: string | null;
  audienceChoice: string | null;
  feelingChoice: string | null;
  designDna: Record<string, number>;
  experienceDna: ExperienceDnaSliders;
  lastRemix: string | null;
  panelOpen: StudioPanelId;
  updatedAt: string;
};

export type ResolvedCanvasTokens = {
  headlineSize: number;
  bodySize: number;
  letterSpacing: string;
  borderRadius: number;
  heroPadding: number;
  accentHex: string;
  backgroundTone: string;
  motionClass: string;
  glassOpacity: number;
  headlineFont: string;
};
