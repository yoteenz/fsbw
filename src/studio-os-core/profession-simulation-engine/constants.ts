/** ARTICLE-E01 — Profession Simulation Engine™ */

export const PROFESSION_SIMULATION_ENGINE_VERSION = '1.1.0';
export const PROFESSION_SIMULATION_ENGINE_ARTICLE_ID = 'ARTICLE-E01';

export const PROFESSION_SIMULATION_PHILOSOPHY = [
  'Studio World should not simply teach knowledge; it should simulate careers.',
  'Learners progress by performing the profession, not consuming traditional lessons.',
  'Every learning moment belongs inside a living workplace scene.',
  'Promotion unlocks responsibilities, clients, environments, tools, income, scenarios, and certifications.',
] as const;

export const PROFESSION_SIMULATION_REPLACEMENTS = {
  lessons: 'scenes',
  modules: 'jobs',
  videos: 'shifts',
  quizzes: 'client challenges',
  assignments: 'projects',
  completion: 'promotion',
} as const;

export const PROFESSION_SIMULATION_FORBIDDEN_LANGUAGE = [
  'lesson list',
  'course module',
  'video library',
  'quiz funnel',
  'static LMS',
  'assignment-only learning',
  'chapter list',
  'training dashboard',
] as const;

export const PROFESSION_SIMULATION_SUPPORTED_PROFESSION_HORIZON = [
  'hair',
  'photography',
  'marketing',
  'architecture',
  'construction',
  'finance',
  'cooking',
  'music',
  'fashion',
  'engineering',
  'legal',
  'healthcare',
  'film',
  'hospitality',
  'trades',
  'business',
] as const;

export const PROFESSION_SIMULATION_MODULE_PATHS = [
  'simulation',
  'careers',
  'jobs',
  'characters',
  'scenarios',
  'progression',
  'reputation',
  'certifications',
  'mentor',
  'profession-brains',
] as const;
