import { readStudioOsJson, writeStudioOsJson } from '../../../utils/studioOsBrowserStorage';
import type { LivingMoodWallState, MoodWallAiSuggestion, MoodWallInspiration } from './types';

const STORAGE_KEY = 'studioOsLivingMoodWall_v1';

type Store = { walls: Record<string, LivingMoodWallState> };

const EMPTY: Store = { walls: {} };

function scopeKey(departmentId: string, projectId: string): string {
  return `${departmentId}:${projectId}`;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

function ensureWall(departmentId: string, projectId: string): LivingMoodWallState {
  const key = scopeKey(departmentId, projectId);
  const existing = readStore().walls[key];
  if (existing) return existing;
  const wall: LivingMoodWallState = {
    departmentId,
    projectId,
    inspirations: [],
    aiSuggestions: [],
    updatedAt: new Date().toISOString(),
  };
  const store = readStore();
  writeStore({ walls: { ...store.walls, [key]: wall } });
  return wall;
}

export function getLivingMoodWall(departmentId: string, projectId: string): LivingMoodWallState {
  return ensureWall(departmentId, projectId);
}

export function addMoodWallInspiration(
  departmentId: string,
  projectId: string,
  input: { title: string; sourceType: string; url: string; note?: string; thumbnail?: string }
): MoodWallInspiration {
  const wall = ensureWall(departmentId, projectId);
  const item: MoodWallInspiration = {
    id: uid('mood'),
    title: input.title.trim(),
    sourceType: input.sourceType,
    url: input.url.trim(),
    note: input.note?.trim(),
    thumbnail: input.thumbnail,
    order: wall.inspirations.length,
    addedAt: new Date().toISOString(),
  };
  const inspirations = [item, ...wall.inspirations];
  const updated: LivingMoodWallState = { ...wall, inspirations, updatedAt: new Date().toISOString() };
  const store = readStore();
  writeStore({ walls: { ...store.walls, [scopeKey(departmentId, projectId)]: updated } });
  return item;
}

export function removeMoodWallInspiration(
  departmentId: string,
  projectId: string,
  inspirationId: string
): void {
  const wall = ensureWall(departmentId, projectId);
  const inspirations = wall.inspirations.filter((i) => i.id !== inspirationId);
  const updated: LivingMoodWallState = { ...wall, inspirations, updatedAt: new Date().toISOString() };
  const store = readStore();
  writeStore({ walls: { ...store.walls, [scopeKey(departmentId, projectId)]: updated } });
}

export function reorderMoodWallInspirations(
  departmentId: string,
  projectId: string,
  orderedIds: string[]
): void {
  const wall = ensureWall(departmentId, projectId);
  const map = new Map(wall.inspirations.map((i) => [i.id, i]));
  const inspirations = orderedIds
    .map((id, order) => {
      const item = map.get(id);
      return item ? { ...item, order } : null;
    })
    .filter((i): i is MoodWallInspiration => Boolean(i));
  const updated: LivingMoodWallState = { ...wall, inspirations, updatedAt: new Date().toISOString() };
  const store = readStore();
  writeStore({ walls: { ...store.walls, [scopeKey(departmentId, projectId)]: updated } });
}

export function addMoodWallAiSuggestion(
  departmentId: string,
  projectId: string,
  input: { summary: string; concepts: string[] }
): MoodWallAiSuggestion {
  const wall = ensureWall(departmentId, projectId);
  const suggestion: MoodWallAiSuggestion = {
    id: uid('sug'),
    summary: input.summary,
    concepts: input.concepts,
    createdAt: new Date().toISOString(),
  };
  const updated: LivingMoodWallState = {
    ...wall,
    aiSuggestions: [suggestion, ...wall.aiSuggestions].slice(0, 6),
    updatedAt: new Date().toISOString(),
  };
  const store = readStore();
  writeStore({ walls: { ...store.walls, [scopeKey(departmentId, projectId)]: updated } });
  return suggestion;
}
