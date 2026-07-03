import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import { getAdminEmailLayoutConfig, putAdminEmailLayoutConfig } from '../../../utils/api';
import {
  EMAIL_PREVIEW_SAMPLE_VARIABLES,
  EMAIL_TEMPLATE_CATEGORIES,
  type EmailTemplateCategoryId,
} from '../../../constants/emailTemplateCatalog';
import {
  applyBatchTypographyPreset,
  coerceEmailLayoutDebugStore,
  DEFAULT_EMAIL_LAYER_STYLES,
  EMAIL_FONT_OPTIONS,
  EMAIL_LAYER_OPTIONS,
  loadEmailLayoutDebugStore,
  mergeEmailLayoutDebugStore,
  patchGlobalLayer,
  patchTemplateCopy,
  resetAllGlobalLayers,
  resetGlobalLayer,
  resetTemplateCopy,
  resolveLayerStyle,
  saveEmailLayoutDebugStore,
  type EmailFontKey,
  type EmailLayerStyle,
  type EmailLayoutDebugStore,
  type EmailLayoutLayerId,
  type EmailTemplateCopyOverrides,
  type EmailTextAlign,
  type EmailTextTransform,
} from '../../../utils/emailLayoutDebug';
import { previewEmailTemplate } from '../../../utils/transactionalEmail';

type TemplateDefaults = Record<
  string,
  {
    scriptAccent: string;
    headline: string;
    bodyParagraphs: string[];
    defaultCtaLabel: string;
    defaultSubject: string;
    preheader: string;
  }
>;

/** Ensure preview iframe can load brand fonts from the current site origin. */
function enhanceEmailPreviewHtml(html: string): string {
  if (!html || typeof window === 'undefined') return html;
  const origin = window.location.origin.replace(/\/$/, '');
  const injection = `<base href="${origin}/"/>
  <style type="text/css">
@font-face { font-family: 'Futura PT Book'; src: url('/assets/Futura%20PT%20Book.ttf') format('truetype'); font-weight: 400; font-style: normal; font-display: swap; }
@font-face { font-family: 'Futura PT Medium'; src: url('/assets/Futura%20PT%20Medium.ttf') format('truetype'); font-weight: 500; font-style: normal; font-display: swap; }
@font-face { font-family: 'Futura PT Demi'; src: url('/assets/fonnts.com-Futura_PT_Demi.otf') format('opentype'); font-weight: 600; font-style: normal; font-display: swap; }
@font-face { font-family: 'Bohemy'; src: url('/assets/Bohemy.otf') format('opentype'); font-weight: 400; font-style: normal; font-display: swap; }
</style>`;
  if (html.includes('<base ')) return html;
  return html.replace(/<head>/i, `<head>${injection}`);
}

const CATEGORY_TABS: Array<{ id: EmailTemplateCategoryId; label: string }> = [
  { id: 'account', label: 'ACCOUNT' },
  { id: 'orders', label: 'ORDERS' },
  { id: 'rewards', label: 'REWARDS' },
  { id: 'affiliate', label: 'AFFILIATE' },
  { id: 'shop', label: 'SHOP' },
];

type EditorTab = 'copy' | 'styles' | 'batch';

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
}) {
  return (
    <label className="block text-[9px] uppercase font-futura text-gray-600 mb-1">
      {label}
      <input
        type="number"
        step={step}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] font-mono bg-white/80"
      />
    </label>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-[9px] uppercase font-futura text-gray-600 mb-1">
      {label}
      <div className="mt-0.5 flex gap-2 items-center">
        <input
          type="color"
          value={value.startsWith('#') && value.length >= 7 ? value.slice(0, 7) : '#808080'}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-10 border border-gray-400 p-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 border border-gray-400 px-2 py-1 text-[10px] font-mono bg-white/80"
        />
      </div>
    </label>
  );
}

function LayerStyleFields({
  layerId,
  style,
  onChange,
}: {
  layerId: EmailLayoutLayerId;
  style: EmailLayerStyle;
  onChange: (patch: Partial<EmailLayerStyle>) => void;
}) {
  const isHero = layerId === 'hero';
  return (
    <div className="grid grid-cols-2 gap-2">
      {!isHero ? (
        <>
          <label className="col-span-2 block text-[9px] uppercase font-futura text-gray-600 mb-1">
            Font
            <select
              value={style.fontFamily ?? DEFAULT_EMAIL_LAYER_STYLES[layerId].fontFamily ?? 'futura-book'}
              onChange={(e) => onChange({ fontFamily: e.target.value as EmailFontKey })}
              className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
            >
              {EMAIL_FONT_OPTIONS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
          <NumberField label="Font size" value={style.fontSize ?? 11} onChange={(fontSize) => onChange({ fontSize })} />
          <ColorField label="Color" value={style.color ?? '#808080'} onChange={(color) => onChange({ color })} />
          <label className="block text-[9px] uppercase font-futura text-gray-600 mb-1">
            Transform
            <select
              value={style.textTransform ?? 'uppercase'}
              onChange={(e) => onChange({ textTransform: e.target.value as EmailTextTransform })}
              className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
            >
              <option value="uppercase">UPPERCASE</option>
              <option value="lowercase">lowercase</option>
              <option value="none">none</option>
            </select>
          </label>
          <label className="block text-[9px] uppercase font-futura text-gray-600 mb-1">
            Align
            <select
              value={style.textAlign ?? 'center'}
              onChange={(e) => onChange({ textAlign: e.target.value as EmailTextAlign })}
              className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </label>
          <label className="col-span-2 block text-[9px] uppercase font-futura text-gray-600 mb-1">
            Letter spacing
            <input
              type="text"
              value={style.letterSpacing ?? ''}
              onChange={(e) => onChange({ letterSpacing: e.target.value })}
              placeholder="0.08em"
              className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] font-mono bg-white/80"
            />
          </label>
          <NumberField
            label="Line height"
            value={style.lineHeight ?? 1.5}
            onChange={(lineHeight) => onChange({ lineHeight })}
            step={0.05}
          />
        </>
      ) : null}
      <NumberField
        label="Pad top"
        value={style.paddingTop ?? 0}
        onChange={(paddingTop) => onChange({ paddingTop })}
      />
      <NumberField
        label="Pad right"
        value={style.paddingRight ?? 0}
        onChange={(paddingRight) => onChange({ paddingRight })}
      />
      <NumberField
        label="Pad bottom"
        value={style.paddingBottom ?? 0}
        onChange={(paddingBottom) => onChange({ paddingBottom })}
      />
      <NumberField
        label="Pad left"
        value={style.paddingLeft ?? 0}
        onChange={(paddingLeft) => onChange({ paddingLeft })}
      />
    </div>
  );
}

export default function EmailTemplatesDebugPage() {
  const navigate = useNavigate();
  const categories = EMAIL_TEMPLATE_CATEGORIES;
  const sampleVariables = EMAIL_PREVIEW_SAMPLE_VARIABLES;
  const [activeCategory, setActiveCategory] = useState<EmailTemplateCategoryId>('account');
  const [selectedType, setSelectedType] = useState<string>(
    EMAIL_TEMPLATE_CATEGORIES[0]?.templates[0]?.type ?? 'welcome'
  );
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [editorTab, setEditorTab] = useState<EditorTab>('copy');
  const [activeLayer, setActiveLayer] = useState<EmailLayoutLayerId>('headline');
  const [layoutStore, setLayoutStore] = useState<EmailLayoutDebugStore>(() => loadEmailLayoutDebugStore());
  const [templateDefaults, setTemplateDefaults] = useState<TemplateDefaults>({});
  const [draftCopy, setDraftCopy] = useState<EmailTemplateCopyOverrides>({});

  useEffect(() => {
    if (!canAccessAdminPages()) {
      navigate('/account', { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    void (async () => {
      try {
        const remoteRaw = await getAdminEmailLayoutConfig();
        const remote = remoteRaw ? coerceEmailLayoutDebugStore(remoteRaw) : null;
        const local = loadEmailLayoutDebugStore();
        const merged = mergeEmailLayoutDebugStore(local, remote);
        setLayoutStore(merged);
        saveEmailLayoutDebugStore(merged);
      } catch {
        /* local only */
      }
    })();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const token = await import('../../../utils/api').then((m) => m.getAccessToken());
        const API_BASE =
          (import.meta as unknown as { env?: { VITE_API_BASE?: string } }).env?.VITE_API_BASE ?? '';
        const url = `${API_BASE.replace(/\/$/, '')}/api/email/templates`;
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch(url, { headers });
        if (res.ok) {
          const data = (await res.json()) as { templateDefaults?: TemplateDefaults };
          if (data.templateDefaults) setTemplateDefaults(data.templateDefaults);
        }
      } catch {
        /* defaults optional */
      }
    })();
  }, []);

  const activeTemplates = useMemo(() => {
    return categories.find((c) => c.id === activeCategory)?.templates ?? [];
  }, [categories, activeCategory]);

  const selectedMeta = useMemo(() => {
    for (const c of categories) {
      const hit = c.templates.find((t) => t.type === selectedType);
      if (hit) return hit;
    }
    return null;
  }, [categories, selectedType]);

  const registryDefaults = templateDefaults[selectedType];

  useEffect(() => {
    const saved = layoutStore.templates[selectedType];
    const base = registryDefaults;
    setDraftCopy({
      scriptAccent: saved?.scriptAccent ?? base?.scriptAccent ?? '',
      headline: saved?.headline ?? base?.headline ?? '',
      bodyParagraphs: saved?.bodyParagraphs ?? base?.bodyParagraphs ?? [''],
      defaultSubject: saved?.defaultSubject ?? base?.defaultSubject ?? '',
      preheader: saved?.preheader ?? base?.preheader ?? '',
      ctaLabel: saved?.ctaLabel ?? base?.defaultCtaLabel ?? '',
      tagline: saved?.tagline ?? 'luxury without limits.',
      closing: saved?.closing ?? 'Thank you for being part of the Slay Society.',
      supportFooterCopy: saved?.supportFooterCopy ?? '',
      supportCtaLabel: saved?.supportCtaLabel ?? '',
    });
  }, [selectedType, layoutStore.templates, registryDefaults]);

  const loadPreview = useCallback(
    async (templateType: string, store: EmailLayoutDebugStore) => {
      setPreviewLoading(true);
      setError('');
      try {
        const { html, subject } = await previewEmailTemplate({
          templateType,
          variables: sampleVariables,
          layoutDebug: store,
        });
        setPreviewHtml(enhanceEmailPreviewHtml(html));
        setPreviewSubject(subject);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Preview failed');
        setPreviewHtml('');
        setPreviewSubject('');
      } finally {
        setPreviewLoading(false);
      }
    },
    [sampleVariables]
  );

  useEffect(() => {
    if (!selectedType) return;
    void loadPreview(selectedType, layoutStore);
  }, [selectedType, layoutStore, loadPreview]);

  const handleCategoryChange = (id: EmailTemplateCategoryId) => {
    setActiveCategory(id);
    const cat = categories.find((c) => c.id === id);
    const first = cat?.templates[0]?.type;
    if (first) setSelectedType(first);
  };

  const persistStore = useCallback(async (next: EmailLayoutDebugStore, message: string) => {
    saveEmailLayoutDebugStore(next);
    setLayoutStore(next);
    setSaveStatus(message);
    try {
      await putAdminEmailLayoutConfig(next as unknown as Record<string, unknown>);
      setSaveStatus(`${message} — synced to server`);
    } catch (e) {
      setSaveStatus(`${message} — saved locally only (${e instanceof Error ? e.message : 'sync failed'})`);
    }
  }, []);

  const handleSaveCopy = () => {
    const bodyParagraphs = (draftCopy.bodyParagraphs ?? []).map((p) => p.trim()).filter(Boolean);
    const patch: EmailTemplateCopyOverrides = {
      ...draftCopy,
      bodyParagraphs: bodyParagraphs.length ? bodyParagraphs : undefined,
    };
    const defaults = registryDefaults;
    const cleaned: EmailTemplateCopyOverrides = {};
    if (patch.scriptAccent && patch.scriptAccent !== defaults?.scriptAccent) cleaned.scriptAccent = patch.scriptAccent;
    if (patch.headline && patch.headline !== defaults?.headline) cleaned.headline = patch.headline;
    if (
      patch.bodyParagraphs &&
      JSON.stringify(patch.bodyParagraphs) !== JSON.stringify(defaults?.bodyParagraphs)
    ) {
      cleaned.bodyParagraphs = patch.bodyParagraphs;
    }
    if (patch.defaultSubject && patch.defaultSubject !== defaults?.defaultSubject) {
      cleaned.defaultSubject = patch.defaultSubject;
    }
    if (patch.preheader && patch.preheader !== defaults?.preheader) cleaned.preheader = patch.preheader;
    if (patch.ctaLabel && patch.ctaLabel !== defaults?.defaultCtaLabel) cleaned.ctaLabel = patch.ctaLabel;
    if (patch.tagline && patch.tagline !== 'luxury without limits.') cleaned.tagline = patch.tagline;
    if (patch.closing && patch.closing !== 'Thank you for being part of the Slay Society.') {
      cleaned.closing = patch.closing;
    }
    if (patch.supportFooterCopy?.trim()) cleaned.supportFooterCopy = patch.supportFooterCopy.trim();
    if (patch.supportCtaLabel?.trim()) cleaned.supportCtaLabel = patch.supportCtaLabel.trim();

    let next = patchTemplateCopy(layoutStore, selectedType, cleaned);
    if (Object.keys(cleaned).length === 0) {
      next = resetTemplateCopy(layoutStore, selectedType);
    }
    void persistStore(next, 'Template copy saved');
  };

  const handleSaveLayerStyle = () => {
    void persistStore(layoutStore, 'Global styles saved');
  };

  const handleLayerPatch = (patch: Partial<EmailLayerStyle>) => {
    setLayoutStore((prev) => patchGlobalLayer(prev, activeLayer, patch));
  };

  const handleResetLayer = () => {
    void persistStore(resetGlobalLayer(layoutStore, activeLayer), `Reset ${activeLayer}`);
  };

  const handleResetAllStyles = () => {
    void persistStore(resetAllGlobalLayers(layoutStore), 'All global styles reset');
  };

  const handleResetTemplateCopy = () => {
    void persistStore(resetTemplateCopy(layoutStore, selectedType), 'Template copy reset');
  };

  const handleApplyBrandPreset = () => {
    void persistStore(applyBatchTypographyPreset(layoutStore), 'Brand typography preset applied to all templates');
  };

  const activeLayerStyle = resolveLayerStyle(activeLayer, layoutStore);
  const hasTemplateOverrides = Boolean(layoutStore.templates[selectedType]);
  const hasGlobalOverrides = Object.keys(layoutStore.globalLayers).length > 0;

  return (
    <div
      className="min-h-screen pb-8"
      style={{
        backgroundImage: "url('/assets/marble-half.png')",
        backgroundSize: 'contain',
        backgroundRepeat: 'repeat',
        backgroundAttachment: 'fixed',
      }}
    >
      <div className="p-4 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={() => navigate('/tools')}
            className="text-[10px] uppercase font-futura text-[#EB1C24]"
          >
            ← TOOLS
          </button>
          <span className="text-[10px] uppercase font-futura text-gray-500">ADMIN DEBUG</span>
        </div>

        <div className="border border-black bg-white/60 backdrop-blur-sm p-4 mb-3">
          <h1 className="text-[14px] uppercase font-futura font-medium text-black mb-1">Email Templates</h1>
          <p className="text-[9px] uppercase font-futura text-gray-500 leading-relaxed">
            Edit copy, typography, colors, and spacing. Global styles apply to every template; per-template copy overrides are saved separately. Production sends use the synced server config.
          </p>
        </div>

        <div className="flex flex-wrap gap-1 mb-3">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleCategoryChange(tab.id)}
              className="px-2 py-1 text-[9px] uppercase font-futura border"
              style={{
                borderColor: activeCategory === tab.id ? '#EB1C24' : '#9ca3af',
                color: activeCategory === tab.id ? '#EB1C24' : '#808080',
                backgroundColor: activeCategory === tab.id ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.5)',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="border border-gray-400 bg-white/60 backdrop-blur-sm mb-3 max-h-36 overflow-y-auto">
          {activeTemplates.map((t) => (
            <button
              key={t.type}
              type="button"
              onClick={() => setSelectedType(t.type)}
              className="w-full text-left px-3 py-2 border-b border-gray-200 last:border-b-0"
              style={{
                backgroundColor: selectedType === t.type ? 'rgba(235,28,36,0.06)' : 'transparent',
              }}
            >
              <div
                className="text-[10px] uppercase font-futura"
                style={{ color: selectedType === t.type ? '#EB1C24' : '#111' }}
              >
                {t.label}
                {layoutStore.templates[t.type] ? (
                  <span className="ml-1 text-[7px] text-[#EB1C24]">• edited</span>
                ) : null}
              </div>
              <div className="text-[8px] uppercase font-futura text-gray-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>

        {selectedMeta ? (
          <div className="border border-black bg-white/60 backdrop-blur-sm p-3 mb-3">
            <div className="text-[10px] uppercase font-futura text-[#EB1C24]">{selectedMeta.label}</div>
            {previewSubject ? (
              <div className="text-[8px] uppercase font-futura text-black mt-2">
                Subject: <span className="text-gray-600">{previewSubject}</span>
              </div>
            ) : null}
            {saveStatus ? (
              <div className="text-[8px] uppercase font-futura text-gray-600 mt-2">{saveStatus}</div>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-1 mb-2">
          {(['copy', 'styles', 'batch'] as EditorTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setEditorTab(tab)}
              className="flex-1 px-2 py-1.5 text-[9px] uppercase font-futura border"
              style={{
                borderColor: editorTab === tab ? '#EB1C24' : '#9ca3af',
                color: editorTab === tab ? '#EB1C24' : '#808080',
                backgroundColor: editorTab === tab ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.5)',
              }}
            >
              {tab === 'copy' ? 'Copy' : tab === 'styles' ? 'Styles' : 'Batch'}
            </button>
          ))}
        </div>

        <div className="border border-gray-400 bg-white/70 backdrop-blur-sm p-3 mb-3">
          {editorTab === 'copy' ? (
            <div className="space-y-2">
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                Script accent
                <input
                  type="text"
                  value={draftCopy.scriptAccent ?? ''}
                  onChange={(e) => setDraftCopy((d) => ({ ...d, scriptAccent: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                />
              </label>
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                Headline
                <input
                  type="text"
                  value={draftCopy.headline ?? ''}
                  onChange={(e) => setDraftCopy((d) => ({ ...d, headline: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                />
              </label>
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                Body paragraphs (blank line between)
                <textarea
                  rows={4}
                  value={(draftCopy.bodyParagraphs ?? []).join('\n\n')}
                  onChange={(e) =>
                    setDraftCopy((d) => ({
                      ...d,
                      bodyParagraphs: e.target.value.split(/\n\n+/),
                    }))
                  }
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80 font-mono"
                />
              </label>
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                Subject line
                <input
                  type="text"
                  value={draftCopy.defaultSubject ?? ''}
                  onChange={(e) => setDraftCopy((d) => ({ ...d, defaultSubject: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                />
              </label>
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                CTA label
                <input
                  type="text"
                  value={draftCopy.ctaLabel ?? ''}
                  onChange={(e) => setDraftCopy((d) => ({ ...d, ctaLabel: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                />
              </label>
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                Tagline (Bohemy — lowercase)
                <input
                  type="text"
                  value={draftCopy.tagline ?? ''}
                  onChange={(e) => setDraftCopy((d) => ({ ...d, tagline: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                />
              </label>
              <label className="block text-[9px] uppercase font-futura text-gray-600">
                Closing line
                <input
                  type="text"
                  value={draftCopy.closing ?? ''}
                  onChange={(e) => setDraftCopy((d) => ({ ...d, closing: e.target.value }))}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                />
              </label>
              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleSaveCopy}
                  className="px-3 py-1.5 text-[9px] uppercase font-futura text-white bg-[#EB1C24]"
                >
                  Save copy
                </button>
                <button
                  type="button"
                  onClick={handleResetTemplateCopy}
                  disabled={!hasTemplateOverrides}
                  className="px-3 py-1.5 text-[9px] uppercase font-futura border border-gray-400 text-gray-600 disabled:opacity-40"
                >
                  Reset copy
                </button>
              </div>
            </div>
          ) : null}

          {editorTab === 'styles' ? (
            <div>
              <label className="block text-[9px] uppercase font-futura text-gray-600 mb-2">
                Layer
                <select
                  value={activeLayer}
                  onChange={(e) => setActiveLayer(e.target.value as EmailLayoutLayerId)}
                  className="mt-0.5 w-full border border-gray-400 px-2 py-1 text-[10px] bg-white/80"
                >
                  {EMAIL_LAYER_OPTIONS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </label>
              <LayerStyleFields layerId={activeLayer} style={activeLayerStyle} onChange={handleLayerPatch} />
              <div className="flex flex-wrap gap-2 pt-3">
                <button
                  type="button"
                  onClick={handleSaveLayerStyle}
                  className="px-3 py-1.5 text-[9px] uppercase font-futura text-white bg-[#EB1C24]"
                >
                  Save styles
                </button>
                <button
                  type="button"
                  onClick={handleResetLayer}
                  className="px-3 py-1.5 text-[9px] uppercase font-futura border border-gray-400 text-gray-600"
                >
                  Reset layer
                </button>
              </div>
            </div>
          ) : null}

          {editorTab === 'batch' ? (
            <div className="space-y-3">
              <p className="text-[9px] uppercase font-futura text-gray-600 leading-relaxed">
                Batch tools apply the same font guidelines and design tokens across all {categories.reduce((n, c) => n + c.templates.length, 0)} templates. Global style layers affect every preview and production send after you save.
              </p>
              <div className="text-[8px] uppercase font-futura text-gray-500">
                {hasGlobalOverrides
                  ? `${Object.keys(layoutStore.globalLayers).length} global layer(s) customized`
                  : 'Using registry defaults for all layers'}
              </div>
              <button
                type="button"
                onClick={handleApplyBrandPreset}
                className="w-full px-3 py-2 text-[9px] uppercase font-futura text-white bg-[#EB1C24]"
              >
                Apply brand typography preset (all templates)
              </button>
              <button
                type="button"
                onClick={handleResetAllStyles}
                disabled={!hasGlobalOverrides}
                className="w-full px-3 py-2 text-[9px] uppercase font-futura border border-gray-400 text-gray-600 disabled:opacity-40"
              >
                Reset all global styles
              </button>
              <button
                type="button"
                onClick={() => void loadPreview(selectedType, layoutStore)}
                disabled={previewLoading}
                className="w-full px-3 py-2 text-[9px] uppercase font-futura border border-[#EB1C24] text-[#EB1C24]"
              >
                {previewLoading ? 'Refreshing…' : 'Refresh preview'}
              </button>
            </div>
          ) : null}
        </div>

        {error ? (
          <div className="border border-[#EB1C24] bg-white/80 p-3 mb-3 text-[9px] uppercase font-futura text-[#EB1C24]">
            {error}
          </div>
        ) : null}

        <div className="border border-gray-400 bg-white overflow-hidden">
          {previewHtml ? (
            <iframe
              title={`Email preview: ${selectedType}`}
              srcDoc={previewHtml}
              className="w-full border-0"
              style={{ minHeight: '720px', background: '#ececec' }}
            />
          ) : (
            <div className="p-8 text-center text-[10px] uppercase font-futura text-gray-500">
              {previewLoading ? 'Rendering preview…' : 'Select a template'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
