import type { KnowledgeProgram } from './types';
import { getOrCreateGuestSessionId } from '../persistence/guest-identity';

const STORAGE_PREFIX = 'studioKnowledgeMirror_v1_';

function storageKey(programId: string): string {
  return `${STORAGE_PREFIX}${programId}`;
}

export function loadKnowledgeProgram(programId: string): KnowledgeProgram | null {
  try {
    const raw = localStorage.getItem(storageKey(programId));
    if (!raw) return null;
    return JSON.parse(raw) as KnowledgeProgram;
  } catch {
    return null;
  }
}

export function saveKnowledgeProgram(program: KnowledgeProgram): void {
  program.updatedAt = new Date().toISOString();
  localStorage.setItem(storageKey(program.programId), JSON.stringify(program));
}

function apiBase(): string {
  return (import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? '') as string;
}

export async function syncKnowledgeProgramToServer(program: KnowledgeProgram): Promise<boolean> {
  try {
    const res = await fetch(`${apiBase()}/api/expert-capture/knowledge-mirror`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Guest-Session-Id': getOrCreateGuestSessionId(),
      },
      body: JSON.stringify({ program }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadKnowledgeProgramFromServer(programId: string): Promise<KnowledgeProgram | null> {
  try {
    const res = await fetch(
      `${apiBase()}/api/expert-capture/knowledge-mirror?programId=${encodeURIComponent(programId)}`,
      { headers: { 'X-Guest-Session-Id': getOrCreateGuestSessionId() } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { program?: KnowledgeProgram };
    return data.program ?? null;
  } catch {
    return null;
  }
}

export async function loadOrCreateProgram(input: {
  profileId: string;
  companyId: string;
  expertName: string;
  profession: string;
  organizationLabel: string;
}): Promise<KnowledgeProgram> {
  const { createEmptyProgram, buildProgramId } = await import('./sync-from-session');
  const programId = buildProgramId(input.profileId, input.companyId, input.expertName);
  const server = await loadKnowledgeProgramFromServer(programId);
  if (server) {
    saveKnowledgeProgram(server);
    return server;
  }
  const local = loadKnowledgeProgram(programId);
  if (local) return local;
  const created = createEmptyProgram(input);
  saveKnowledgeProgram(created);
  return created;
}

export function persistKnowledgeProgram(program: KnowledgeProgram): KnowledgeProgram {
  saveKnowledgeProgram(program);
  void syncKnowledgeProgramToServer(program);
  return program;
}
