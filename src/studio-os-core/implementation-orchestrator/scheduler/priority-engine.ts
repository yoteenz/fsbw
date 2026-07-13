import type { JobPriority } from '../schemas/os-job';

const PRIORITY_SCORES: Record<JobPriority, number> = {
  CRITICAL: 100,
  HIGH: 75,
  NORMAL: 50,
  LOW: 25,
  BACKGROUND: 10,
};

export function priorityToScore(priority: JobPriority): number {
  return PRIORITY_SCORES[priority];
}

export function scoreToPriority(score: number): JobPriority {
  if (score >= 90) return 'CRITICAL';
  if (score >= 65) return 'HIGH';
  if (score >= 40) return 'NORMAL';
  if (score >= 20) return 'LOW';
  return 'BACKGROUND';
}

export function mapLegacyPriority(legacy: number): JobPriority {
  if (legacy >= 90) return 'CRITICAL';
  if (legacy >= 70) return 'HIGH';
  if (legacy >= 45) return 'NORMAL';
  if (legacy >= 20) return 'LOW';
  return 'BACKGROUND';
}

export function compareJobPriority(a: { priorityScore: number; createdDate: string }, b: { priorityScore: number; createdDate: string }): number {
  if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;
  return new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime();
}

export function sortJobsByPriority<T extends { priorityScore: number; createdDate: string }>(jobs: T[]): T[] {
  return [...jobs].sort(compareJobPriority);
}
