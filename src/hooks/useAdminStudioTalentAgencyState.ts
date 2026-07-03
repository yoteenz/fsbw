import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_TALENT_DEFAULTS,
  createBlankTalent,
  type TalentAgencyEntry,
  type TalentFieldKey,
  type TalentPromptVersion,
  type TalentStatus,
} from '../utils/adminStudioTalentAgencyDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type TalentPatch = Partial<TalentAgencyEntry>;
type TalentPatchStore = Record<string, TalentPatch>;

const DEFAULT_IDS = new Set(ADMIN_STUDIO_TALENT_DEFAULTS.map((t) => t.id));

function readPatches(): TalentPatchStore {
  return readStudioJson<TalentPatchStore>(ADMIN_STUDIO_STORAGE_KEYS.talentAgency) ?? {};
}

function readCustomTalent(): TalentAgencyEntry[] {
  return readStudioJson<TalentAgencyEntry[]>(ADMIN_STUDIO_STORAGE_KEYS.talentAgencyCustom) ?? [];
}

function writePatches(store: TalentPatchStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.talentAgency, store);
}

function writeCustomTalent(talent: TalentAgencyEntry[]): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.talentAgencyCustom, talent);
}

function mergeDefaults(patches: TalentPatchStore): TalentAgencyEntry[] {
  return ADMIN_STUDIO_TALENT_DEFAULTS.map((d) => ({ ...d, ...(patches[d.id] ?? {}) }));
}

export function listTalentAgency(): TalentAgencyEntry[] {
  const patches = readPatches();
  const custom = readCustomTalent();
  const merged = mergeDefaults(patches);
  const customOnly = custom.filter((c) => !DEFAULT_IDS.has(c.id));
  return [...merged, ...customOnly];
}

export function getTalentAgencyById(talentId: string): TalentAgencyEntry | undefined {
  return listTalentAgency().find((t) => t.id === talentId);
}

export function exportTalentAgencySnapshot() {
  return {
    talent: listTalentAgency(),
    source: 'talent-agency-local' as const,
  };
}

function patchTalent(talentId: string, patch: TalentPatch): void {
  if (DEFAULT_IDS.has(talentId)) {
    const store = readPatches();
    store[talentId] = { ...(store[talentId] ?? {}), ...patch };
    writePatches(store);
    return;
  }
  const custom = readCustomTalent();
  const idx = custom.findIndex((t) => t.id === talentId);
  if (idx >= 0) {
    custom[idx] = { ...custom[idx], ...patch };
    writeCustomTalent(custom);
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

export function useAdminStudioTalentAgency(talentId?: string) {
  const [talent, setTalent] = useState(listTalentAgency);
  const [wardrobeSearch, setWardrobeSearch] = useState('');

  const selectedTalent = useMemo(
    () => (talentId ? talent.find((t) => t.id === talentId) ?? null : null),
    [talent, talentId]
  );

  const updateField = useCallback((id: string, key: TalentFieldKey, value: string) => {
    setTalent((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        const updated = { ...t, [key]: value, lastUpdated: new Date().toISOString().slice(0, 10) };
        patchTalent(id, { [key]: value, lastUpdated: updated.lastUpdated });
        return updated;
      });
      return next;
    });
  }, []);

  const setStatus = useCallback((id: string, status: TalentStatus) => {
    setTalent((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, status } : t));
      patchTalent(id, { status });
      return next;
    });
  }, []);

  const addCustomTalent = useCallback((name: string) => {
    const base = slugify(name) || `talent-${Date.now()}`;
    let id = base;
    let n = 1;
    const existing = new Set(listTalentAgency().map((t) => t.id));
    while (existing.has(id)) {
      id = `${base}-${n++}`;
    }
    const entry = createBlankTalent(id, name);
    const custom = readCustomTalent();
    custom.push(entry);
    writeCustomTalent(custom);
    setTalent(listTalentAgency());
    return id;
  }, []);

  const addPromptVersion = useCallback((id: string, label: string, body: string) => {
    setTalent((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        const version: TalentPromptVersion = {
          id: `pv-${Date.now()}`,
          label,
          body,
          createdAt: new Date().toISOString().slice(0, 10),
        };
        const promptVersions = [version, ...t.promptVersions];
        patchTalent(id, { promptVersions });
        return { ...t, promptVersions, lastUpdated: version.createdAt };
      });
      return next;
    });
  }, []);

  const filteredWardrobe = useMemo(() => {
    if (!selectedTalent) return [];
    const q = wardrobeSearch.trim().toLowerCase();
    if (!q) return selectedTalent.wardrobeCatalog;
    return selectedTalent.wardrobeCatalog.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.outfit.toLowerCase().includes(q) ||
        w.hairStyle.toLowerCase().includes(q)
    );
  }, [selectedTalent, wardrobeSearch]);

  return {
    talent,
    selectedTalent,
    wardrobeSearch,
    setWardrobeSearch,
    filteredWardrobe,
    updateField,
    setStatus,
    addCustomTalent,
    addPromptVersion,
  };
}
