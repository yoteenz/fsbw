import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_DEFAULT_PROMPTS,
  type AdminStudioPromptCategoryId,
  type AdminStudioPromptEntry,
} from '../utils/adminStudioPromptLibraryDemo';

const PROMPTS_STORAGE_KEY = 'adminStudioPromptLibrary_v1';
const FAVORITES_STORAGE_KEY = 'adminStudioPromptFavorites_v1';

type PromptPatch = Partial<Pick<AdminStudioPromptEntry, 'title' | 'description' | 'body'>>;

function readPromptPatches(): Record<string, PromptPatch> {
  try {
    const raw = localStorage.getItem(PROMPTS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, PromptPatch>) : {};
  } catch {
    return {};
  }
}

function writePromptPatch(id: string, patch: PromptPatch): void {
  const store = readPromptPatches();
  store[id] = { ...(store[id] ?? {}), ...patch };
  localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(store));
}

function readFavorites(): Set<AdminStudioPromptCategoryId> {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as AdminStudioPromptCategoryId[]);
  } catch {
    return new Set();
  }
}

function writeFavorites(favorites: Set<AdminStudioPromptCategoryId>): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify([...favorites]));
}

function mergePrompt(defaults: AdminStudioPromptEntry, patch?: PromptPatch): AdminStudioPromptEntry {
  if (!patch) return { ...defaults };
  return { ...defaults, ...patch };
}

export function listAdminStudioPrompts(): AdminStudioPromptEntry[] {
  const patches = readPromptPatches();
  return ADMIN_STUDIO_DEFAULT_PROMPTS.map((d) => mergePrompt(d, patches[d.id]));
}

export function useAdminStudioPromptLibrary() {
  const [prompts, setPrompts] = useState<AdminStudioPromptEntry[]>(listAdminStudioPrompts);
  const [favorites, setFavorites] = useState<Set<AdminStudioPromptCategoryId>>(readFavorites);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<AdminStudioPromptCategoryId | 'all' | 'favorites'>('all');
  const [selectedId, setSelectedId] = useState<AdminStudioPromptCategoryId | null>(
    ADMIN_STUDIO_DEFAULT_PROMPTS[0]?.id ?? null
  );

  const selectedPrompt = useMemo(
    () => prompts.find((p) => p.id === selectedId) ?? null,
    [prompts, selectedId]
  );

  const filteredPrompts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prompts.filter((p) => {
      if (categoryFilter === 'favorites' && !favorites.has(p.id)) return false;
      if (categoryFilter !== 'all' && categoryFilter !== 'favorites' && p.id !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [p.title, p.description, p.category, p.body, ...p.tags].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [prompts, search, categoryFilter, favorites]);

  const updatePromptField = useCallback(
    (id: AdminStudioPromptCategoryId, key: keyof PromptPatch, value: string) => {
      setPrompts((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, [key]: value } : p));
        const updated = next.find((p) => p.id === id);
        if (updated) {
          writePromptPatch(id, { [key]: value });
        }
        return next;
      });
    },
    []
  );

  const toggleFavorite = useCallback((id: AdminStudioPromptCategoryId) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeFavorites(next);
      return next;
    });
  }, []);

  return {
    prompts,
    filteredPrompts,
    favorites,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    selectedId,
    setSelectedId,
    selectedPrompt,
    updatePromptField,
    toggleFavorite,
  };
}
