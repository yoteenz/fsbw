import { useCallback, useMemo, useState } from 'react';
import {
  ADMIN_STUDIO_APPROVAL_RULES_DEFAULTS,
  ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS,
  ADMIN_STUDIO_CONTENT_CALENDAR_DEFAULTS,
  ADMIN_STUDIO_CONTENT_ENGINE_DEFAULTS,
  ADMIN_STUDIO_EDITORIAL_RULES_DEFAULTS,
  ADMIN_STUDIO_PSA_PERSONALITY_DEFAULTS,
  type ContentBrainFieldRecord,
  type ContentCalendarDay,
} from '../utils/adminStudioContentBrainDemo';
import {
  ADMIN_STUDIO_CAMPAIGN_FRAMEWORKS_DEFAULTS,
  type CampaignFrameworkEntry,
  type CampaignFrameworkFieldKey,
} from '../utils/adminStudioContentBrainCampaignsDemo';
import {
  ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS,
  ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS,
  type CtaLibraryEntry,
  type CtaLibraryFieldKey,
  type ProductKnowledgeEntry,
  type ProductKnowledgeFieldKey,
} from '../utils/adminStudioContentBrainCatalogDemo';
import {
  ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS,
  type PromptFrameworkEntry,
} from '../utils/adminStudioContentBrainPromptFrameworksDemo';
import {
  ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS,
  type ContentBrainShowBibleEntry,
  type ContentBrainShowBibleFieldKey,
} from '../utils/adminStudioContentBrainShowBibleDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson, type AdminStudioStorageKey } from '../utils/adminStudioStorage';

type AdminStudioStorageKeyName = keyof typeof ADMIN_STUDIO_STORAGE_KEYS;

// ─── Generic field record helpers ──────────────────────────────

function mergeFieldRecord(defaults: ContentBrainFieldRecord, patches?: ContentBrainFieldRecord): ContentBrainFieldRecord {
  return { ...defaults, ...(patches ?? {}) };
}

function readFieldPatches(key: AdminStudioStorageKey): ContentBrainFieldRecord {
  return readStudioJson<ContentBrainFieldRecord>(key) ?? {};
}

function writeFieldPatch(key: AdminStudioStorageKey, fieldKey: string, value: string): void {
  const store = readFieldPatches(key);
  store[fieldKey] = value;
  writeStudioJson(key, store);
}

// ─── Record list helpers (shows, campaigns, products, CTAs) ───

function mergeRecordList<T extends { id: string }>(
  defaults: T[],
  patches: Record<string, Partial<T>> | null
): T[] {
  return defaults.map((d) => ({ ...d, ...(patches?.[d.id] ?? {}) }));
}

function writeRecordPatch<T extends Record<string, unknown>>(
  key: AdminStudioStorageKeyName,
  id: string,
  patch: Partial<T>
): void {
  const store = readStudioJson<Record<string, Partial<T>>>(ADMIN_STUDIO_STORAGE_KEYS[key]) ?? {};
  store[id] = { ...(store[id] ?? {}), ...patch };
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS[key], store);
}

// ─── Brand Brain ───────────────────────────────────────────────

export function listContentBrainBrand(): ContentBrainFieldRecord {
  const patches = readFieldPatches(ADMIN_STUDIO_STORAGE_KEYS.contentBrainBrand);
  return mergeFieldRecord(ADMIN_STUDIO_BRAND_BRAIN_DEFAULTS, patches);
}

export function useContentBrainBrand() {
  const [fields, setFields] = useState(listContentBrainBrand);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      writeFieldPatch(ADMIN_STUDIO_STORAGE_KEYS.contentBrainBrand, key, value);
      return next;
    });
  }, []);

  return { fields, updateField };
}

// ─── PSA Personality ───────────────────────────────────────────

export function listContentBrainPsa(): ContentBrainFieldRecord {
  const patches = readFieldPatches(ADMIN_STUDIO_STORAGE_KEYS.contentBrainPsa);
  return mergeFieldRecord(ADMIN_STUDIO_PSA_PERSONALITY_DEFAULTS, patches);
}

export function useContentBrainPsa() {
  const [fields, setFields] = useState(listContentBrainPsa);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      writeFieldPatch(ADMIN_STUDIO_STORAGE_KEYS.contentBrainPsa, key, value);
      return next;
    });
  }, []);

  return { fields, updateField };
}

// ─── Editorial Rules ───────────────────────────────────────────

export function listContentBrainEditorial(): ContentBrainFieldRecord {
  const patches = readFieldPatches(ADMIN_STUDIO_STORAGE_KEYS.contentBrainEditorial);
  return mergeFieldRecord(ADMIN_STUDIO_EDITORIAL_RULES_DEFAULTS, patches);
}

export function useContentBrainEditorial() {
  const [fields, setFields] = useState(listContentBrainEditorial);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      writeFieldPatch(ADMIN_STUDIO_STORAGE_KEYS.contentBrainEditorial, key, value);
      return next;
    });
  }, []);

  return { fields, updateField };
}

// ─── Approval Rules ────────────────────────────────────────────

export function listContentBrainApproval(): ContentBrainFieldRecord {
  const patches = readFieldPatches(ADMIN_STUDIO_STORAGE_KEYS.contentBrainApproval);
  return mergeFieldRecord(ADMIN_STUDIO_APPROVAL_RULES_DEFAULTS, patches);
}

export function useContentBrainApproval() {
  const [fields, setFields] = useState(listContentBrainApproval);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      writeFieldPatch(ADMIN_STUDIO_STORAGE_KEYS.contentBrainApproval, key, value);
      return next;
    });
  }, []);

  return { fields, updateField };
}

// ─── Show Bible ────────────────────────────────────────────────

export function listContentBrainShowBible(): ContentBrainShowBibleEntry[] {
  const patches = readStudioJson<Record<string, Partial<ContentBrainShowBibleEntry>>>(
    ADMIN_STUDIO_STORAGE_KEYS.contentBrainShowBible
  );
  return mergeRecordList(ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS, patches);
}

export function useContentBrainShowBible() {
  const [shows, setShows] = useState(listContentBrainShowBible);
  const [selectedId, setSelectedId] = useState(ADMIN_STUDIO_SHOW_BIBLE_DEFAULTS[0]?.id ?? null);

  const selectedShow = useMemo(
    () => shows.find((s) => s.id === selectedId) ?? null,
    [shows, selectedId]
  );

  const updateShowField = useCallback((showId: string, key: ContentBrainShowBibleFieldKey, value: string) => {
    setShows((prev) => {
      const next = prev.map((s) => (s.id === showId ? { ...s, [key]: value } : s));
      writeRecordPatch('contentBrainShowBible', showId, { [key]: value });
      return next;
    });
  }, []);

  return { shows, selectedId, setSelectedId, selectedShow, updateShowField };
}

// ─── Prompt Frameworks ─────────────────────────────────────────

type PromptFrameworkPatch = Partial<Pick<PromptFrameworkEntry, 'title' | 'description' | 'body' | 'tags'>> & {
  versions?: PromptFrameworkEntry['versions'];
};

function listPromptFrameworks(): PromptFrameworkEntry[] {
  const patches = readStudioJson<Record<string, PromptFrameworkPatch>>(
    ADMIN_STUDIO_STORAGE_KEYS.contentBrainPromptFrameworks
  );
  return ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS.map((d) => {
    const p = patches?.[d.id];
    if (!p) return { ...d };
    return {
      ...d,
      ...p,
      tags: p.tags ?? d.tags,
      versions: p.versions ?? d.versions,
    };
  });
}

function readPromptFrameworkFavorites(): Set<string> {
  const list = readStudioJson<string[]>(ADMIN_STUDIO_STORAGE_KEYS.contentBrainPromptFavorites);
  return new Set(list ?? []);
}

export function useContentBrainPromptFrameworks() {
  const [prompts, setPrompts] = useState(listPromptFrameworks);
  const [favorites, setFavorites] = useState(readPromptFrameworkFavorites);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState(ADMIN_STUDIO_PROMPT_FRAMEWORKS_DEFAULTS[0]?.id ?? null);

  const selectedPrompt = useMemo(
    () => prompts.find((p) => p.id === selectedId) ?? null,
    [prompts, selectedId]
  );

  const filteredPrompts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return prompts.filter((p) => {
      if (categoryFilter === 'favorites' && !favorites.has(p.id)) return false;
      if (categoryFilter !== 'all' && categoryFilter !== 'favorites' && p.categoryId !== categoryFilter) return false;
      if (!q) return true;
      const haystack = [p.title, p.description, p.category, p.body, ...p.tags].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [prompts, search, categoryFilter, favorites]);

  const updatePromptField = useCallback(
    (id: string, key: keyof PromptFrameworkPatch, value: string | string[]) => {
      setPrompts((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, [key]: value } : p));
        const updated = next.find((p) => p.id === id);
        if (updated) {
          writeRecordPatch('contentBrainPromptFrameworks', id, {
            [key]: value,
          } as PromptFrameworkPatch);
        }
        return next;
      });
    },
    []
  );

  const savePromptVersion = useCallback((id: string, note: string) => {
    setPrompts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const version = {
          id: `v${p.versions.length + 1}`,
          savedAt: new Date().toISOString(),
          body: p.body,
          note: note || `VERSION ${p.versions.length + 1}`,
        };
        const versions = [...p.versions, version];
        writeRecordPatch('contentBrainPromptFrameworks', id, { versions, body: p.body });
        return { ...p, versions };
      });
      return next;
    });
  }, []);

  const restorePromptVersion = useCallback((id: string, versionId: string) => {
    setPrompts((prev) => {
      const next = prev.map((p) => {
        if (p.id !== id) return p;
        const version = p.versions.find((v) => v.id === versionId);
        if (!version) return p;
        writeRecordPatch('contentBrainPromptFrameworks', id, { body: version.body });
        return { ...p, body: version.body };
      });
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.contentBrainPromptFavorites, [...next]);
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
    savePromptVersion,
    restorePromptVersion,
    toggleFavorite,
  };
}

// ─── Campaign Frameworks ───────────────────────────────────────

export function listContentBrainCampaigns(): CampaignFrameworkEntry[] {
  const patches = readStudioJson<Record<string, Partial<CampaignFrameworkEntry>>>(
    ADMIN_STUDIO_STORAGE_KEYS.contentBrainCampaigns
  );
  return mergeRecordList(ADMIN_STUDIO_CAMPAIGN_FRAMEWORKS_DEFAULTS, patches);
}

export function useContentBrainCampaigns() {
  const [campaigns, setCampaigns] = useState(listContentBrainCampaigns);
  const [selectedId, setSelectedId] = useState(ADMIN_STUDIO_CAMPAIGN_FRAMEWORKS_DEFAULTS[0]?.id ?? null);

  const selectedCampaign = useMemo(
    () => campaigns.find((c) => c.id === selectedId) ?? null,
    [campaigns, selectedId]
  );

  const updateCampaignField = useCallback(
    (id: string, key: CampaignFrameworkFieldKey, value: string) => {
      setCampaigns((prev) => {
        const next = prev.map((c) => (c.id === id ? { ...c, [key]: value } : c));
        writeRecordPatch('contentBrainCampaigns', id, { [key]: value });
        return next;
      });
    },
    []
  );

  return { campaigns, selectedId, setSelectedId, selectedCampaign, updateCampaignField };
}

// ─── Product Knowledge ─────────────────────────────────────────

export function listContentBrainProducts(): ProductKnowledgeEntry[] {
  const patches = readStudioJson<Record<string, Partial<ProductKnowledgeEntry>>>(
    ADMIN_STUDIO_STORAGE_KEYS.contentBrainProducts
  );
  return mergeRecordList(ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS, patches);
}

export function useContentBrainProducts() {
  const [products, setProducts] = useState(listContentBrainProducts);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(ADMIN_STUDIO_PRODUCT_KNOWLEDGE_DEFAULTS[0]?.id ?? null);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const haystack = Object.values(p).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [products, search]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId]
  );

  const updateProductField = useCallback(
    (id: string, key: ProductKnowledgeFieldKey, value: string) => {
      setProducts((prev) => {
        const next = prev.map((p) => (p.id === id ? { ...p, [key]: value } : p));
        writeRecordPatch('contentBrainProducts', id, { [key]: value });
        return next;
      });
    },
    []
  );

  return {
    products,
    filteredProducts,
    search,
    setSearch,
    selectedId,
    setSelectedId,
    selectedProduct,
    updateProductField,
  };
}

// ─── CTA Library ───────────────────────────────────────────────

export function listContentBrainCtas(): CtaLibraryEntry[] {
  const patches = readStudioJson<Record<string, Partial<CtaLibraryEntry>>>(
    ADMIN_STUDIO_STORAGE_KEYS.contentBrainCtas
  );
  return mergeRecordList(ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS, patches);
}

export function useContentBrainCtas() {
  const [ctas, setCtas] = useState(listContentBrainCtas);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(ADMIN_STUDIO_CTA_LIBRARY_DEFAULTS[0]?.id ?? null);

  const filteredCtas = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return ctas;
    return ctas.filter((c) => {
      const haystack = Object.values(c).join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [ctas, search]);

  const selectedCta = useMemo(() => ctas.find((c) => c.id === selectedId) ?? null, [ctas, selectedId]);

  const updateCtaField = useCallback((id: string, key: CtaLibraryFieldKey, value: string) => {
    setCtas((prev) => {
      const next = prev.map((c) => (c.id === id ? { ...c, [key]: value } : c));
      writeRecordPatch('contentBrainCtas', id, { [key]: value });
      return next;
    });
  }, []);

  return {
    ctas,
    filteredCtas,
    search,
    setSearch,
    selectedId,
    setSelectedId,
    selectedCta,
    updateCtaField,
  };
}

// ─── Content Engine ────────────────────────────────────────────

export function listContentBrainEngine(): ContentBrainFieldRecord {
  const patches = readFieldPatches(ADMIN_STUDIO_STORAGE_KEYS.contentBrainEngine);
  return mergeFieldRecord(ADMIN_STUDIO_CONTENT_ENGINE_DEFAULTS, patches);
}

export function useContentBrainEngine() {
  const [fields, setFields] = useState(listContentBrainEngine);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => {
      const next = { ...prev, [key]: value };
      writeFieldPatch(ADMIN_STUDIO_STORAGE_KEYS.contentBrainEngine, key, value);
      return next;
    });
  }, []);

  return { fields, updateField };
}

// ─── Content Calendar ──────────────────────────────────────────

export function listContentBrainCalendar(): ContentCalendarDay[] {
  const patches = readStudioJson<Record<string, Partial<ContentCalendarDay>>>(
    ADMIN_STUDIO_STORAGE_KEYS.contentBrainCalendar
  );
  return mergeRecordList(ADMIN_STUDIO_CONTENT_CALENDAR_DEFAULTS, patches);
}

export function useContentBrainCalendar() {
  const [days, setDays] = useState(listContentBrainCalendar);

  const updateDayField = useCallback((dayId: string, key: keyof ContentCalendarDay, value: string) => {
    setDays((prev) => {
      const next = prev.map((d) => (d.id === dayId ? { ...d, [key]: value } : d));
      writeRecordPatch('contentBrainCalendar', dayId, { [key]: value });
      return next;
    });
  }, []);

  return { days, updateDayField };
}

/** Aggregate export for Phase 2 AI services — read-only snapshot. */
export function exportContentBrainSnapshot() {
  return {
    brandBrain: listContentBrainBrand(),
    psaPersonality: listContentBrainPsa(),
    showBible: listContentBrainShowBible(),
    editorialRules: listContentBrainEditorial(),
    promptFrameworks: listPromptFrameworks(),
    campaignFrameworks: listContentBrainCampaigns(),
    productKnowledge: listContentBrainProducts(),
    ctaLibrary: listContentBrainCtas(),
    contentEngine: listContentBrainEngine(),
    contentCalendar: listContentBrainCalendar(),
    approvalRules: listContentBrainApproval(),
    exportedAt: new Date().toISOString(),
  };
}
