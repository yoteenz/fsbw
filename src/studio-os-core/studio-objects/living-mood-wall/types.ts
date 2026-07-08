/** Living Mood Wall™ — reusable Studio Object (department + project scoped). */

export type MoodWallInspiration = {
  id: string;
  title: string;
  sourceType: string;
  url: string;
  thumbnail?: string;
  note?: string;
  order: number;
  addedAt: string;
};

export type MoodWallAiSuggestion = {
  id: string;
  summary: string;
  concepts: string[];
  createdAt: string;
};

export type LivingMoodWallState = {
  departmentId: string;
  projectId: string;
  inspirations: MoodWallInspiration[];
  aiSuggestions: MoodWallAiSuggestion[];
  updatedAt: string;
};
