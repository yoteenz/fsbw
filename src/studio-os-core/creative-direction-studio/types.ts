/**
 * Creative Direction Studio™ — canonical creative operating layer (above Studio Production Engine).
 */

export type InspirationSourceType =
  | 'instagram-reel'
  | 'tiktok'
  | 'pinterest'
  | 'behance'
  | 'dribbble'
  | 'youtube'
  | 'website'
  | 'packaging'
  | 'product-photo'
  | 'luxury-campaign'
  | 'ui-screenshot'
  | 'video'
  | 'film'
  | 'music'
  | 'photography'
  | 'magazine'
  | 'other';

export type MoodBoardSectionId =
  | 'visual-style'
  | 'photography'
  | 'packaging'
  | 'products'
  | 'ui'
  | 'animation'
  | 'lighting'
  | 'materials'
  | 'typography'
  | 'motion'
  | 'brand-references'
  | 'competitors'
  | 'audio'
  | 'color';

export type CreativeConciergeId =
  | 'visual'
  | 'editorial'
  | 'brand'
  | 'motion'
  | 'marketing'
  | 'studio-orb';

export type CreativeNoteKind =
  | 'text'
  | 'voice'
  | 'sketch'
  | 'image'
  | 'video'
  | 'link'
  | 'reference'
  | 'screenshot'
  | 'annotation'
  | 'mood-change'
  | 'strategy'
  | 'visual-feedback';

export type CreativeNoteStatus = 'open' | 'routed' | 'in-revision' | 'resolved' | 'archived';

export type ExtractedReferenceIntelligence = {
  lighting: string[];
  composition: string[];
  mood: string[];
  materials: string[];
  typography: string[];
  motion: string[];
  cameraAngle: string[];
  pacing: string[];
  luxuryCues: string[];
  colorPalette: string[];
  brandPersonality: string[];
  emotionalDirection: string[];
  visualHierarchy: string[];
  designLanguage: string[];
};

export type InspirationReference = {
  id: string;
  branchId: string;
  title: string;
  sourceType: InspirationSourceType;
  url: string;
  thumbnail?: string;
  caption?: string;
  addedAt: string;
  addedBy: string;
  analysis: ExtractedReferenceIntelligence;
  moodBoardSections: MoodBoardSectionId[];
};

export type CreativeBrief = {
  objective: string;
  audience: string;
  tone: string[];
  constraints: string[];
  updatedAt: string;
};

export type LivingMoodBoard = {
  updatedAt: string;
  sections: Record<MoodBoardSectionId, string[]>;
};

export type CreativeDirectionNote = {
  id: string;
  branchId: string;
  kind: CreativeNoteKind;
  body: string;
  author: string;
  createdAt: string;
  status: CreativeNoteStatus;
  assignedConcierge: CreativeConciergeId;
  departmentOrigin?: string;
  linkedReferenceId?: string;
};

export type AiCreativeSuggestion = {
  id: string;
  branchId: string;
  createdAt: string;
  prompt: string;
  summary: string;
  concepts: string[];
};

export type ConciergeRecommendation = {
  id: string;
  branchId: string;
  conciergeId: CreativeConciergeId;
  createdAt: string;
  recommendation: string;
  rationale: string;
};

export type DirectionVersion = {
  id: string;
  branchId: string;
  createdAt: string;
  label: string;
  summary: string;
  changedFields: string[];
};

export type DirectionTimelineEvent = {
  id: string;
  createdAt: string;
  type: 'branch-created' | 'branch-activated' | 'reference-added' | 'command' | 'note' | 'impact-warning' | 'merge';
  label: string;
  detail: string;
  branchId?: string;
};

export type CreativeDirectionBranch = {
  id: string;
  name: string;
  createdAt: string;
  brief: CreativeBrief;
  vision: string;
  northStar: string;
  moodBoard: LivingMoodBoard;
  references: InspirationReference[];
  notes: CreativeDirectionNote[];
  aiSuggestions: AiCreativeSuggestion[];
  conciergeRecommendations: ConciergeRecommendation[];
  versionHistory: DirectionVersion[];
};

export type CreativeDirectionProject = {
  id: string;
  name: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  activeBranchId: string;
  branches: CreativeDirectionBranch[];
  directionTimeline: DirectionTimelineEvent[];
};

export type DirectionChangeImpact = {
  affectedDepartments: string[];
  affectedArtifacts: string[];
  summary: string;
  options: Array<{
    id: 'update-downstream' | 'rebuild-stages' | 'keep-versions' | 'parallel-branch';
    label: string;
    detail: string;
  }>;
};

export type CreativeCommandResult = {
  understood: string;
  actions: string[];
  branchId?: string;
  newBranch?: CreativeDirectionBranch;
  suggestions?: AiCreativeSuggestion;
  impact?: DirectionChangeImpact;
};

export const MOOD_BOARD_SECTION_LABELS: Record<MoodBoardSectionId, string> = {
  'visual-style': 'Visual Style',
  photography: 'Photography',
  packaging: 'Packaging',
  products: 'Products',
  ui: 'UI',
  animation: 'Animation',
  lighting: 'Lighting',
  materials: 'Materials',
  typography: 'Typography',
  motion: 'Motion',
  'brand-references': 'Brand References',
  competitors: 'Competitors',
  audio: 'Audio',
  color: 'Color',
};

export const CREATIVE_CONCIERGE_LABELS: Record<CreativeConciergeId, string> = {
  visual: 'Visual Concierge™',
  editorial: 'Editorial Concierge™',
  brand: 'Brand Concierge™',
  motion: 'Motion Concierge™',
  marketing: 'Marketing Concierge™',
  'studio-orb': 'Studio Orb · Studio Intelligence™',
};

export const NDXBOOK_PAGE_001_PROJECT_ID = 'ndxbook-page-001';
