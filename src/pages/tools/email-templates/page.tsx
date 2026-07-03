import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import {
  fetchEmailTemplateCatalog,
  previewEmailTemplate,
  type EmailTemplateCategory,
} from '../../../utils/transactionalEmail';

const CATEGORY_TABS: Array<{ id: EmailTemplateCategory['id']; label: string }> = [
  { id: 'account', label: 'ACCOUNT' },
  { id: 'orders', label: 'ORDERS' },
  { id: 'rewards', label: 'REWARDS' },
  { id: 'affiliate', label: 'AFFILIATE' },
  { id: 'shop', label: 'SHOP' },
];

export default function EmailTemplatesDebugPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<EmailTemplateCategory[]>([]);
  const [sampleVariables, setSampleVariables] = useState<Record<string, string | number>>({});
  const [activeCategory, setActiveCategory] = useState<EmailTemplateCategory['id']>('account');
  const [selectedType, setSelectedType] = useState<string>('welcome');
  const [previewHtml, setPreviewHtml] = useState('');
  const [previewSubject, setPreviewSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!canAccessAdminPages()) {
      navigate('/account', { replace: true });
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchEmailTemplateCatalog();
        if (cancelled) return;
        setCategories(data.categories);
        setSampleVariables(data.sampleVariables);
        const first = data.categories[0]?.templates[0]?.type;
        if (first) {
          setSelectedType(first);
          setActiveCategory(data.categories[0].id);
        }
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load catalog');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

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

  const loadPreview = useCallback(async (templateType: string) => {
    setPreviewLoading(true);
    setError('');
    try {
      const { html, subject } = await previewEmailTemplate({
        templateType,
        variables: sampleVariables,
      });
      setPreviewHtml(html);
      setPreviewSubject(subject);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Preview failed');
      setPreviewHtml('');
      setPreviewSubject('');
    } finally {
      setPreviewLoading(false);
    }
  }, [sampleVariables]);

  useEffect(() => {
    if (!selectedType || loading) return;
    void loadPreview(selectedType);
  }, [selectedType, loading, loadPreview]);

  const handleCategoryChange = (id: EmailTemplateCategory['id']) => {
    setActiveCategory(id);
    const cat = categories.find((c) => c.id === id);
    const first = cat?.templates[0]?.type;
    if (first) setSelectedType(first);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: "url('/assets/marble-half.png')", backgroundSize: 'contain', backgroundRepeat: 'repeat' }}>
        <p className="text-[11px] uppercase font-futura text-gray-500">Loading email templates…</p>
      </div>
    );
  }

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
            Preview all Frontal Slayer transactional designs. Live HTML text — not image-only emails.
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

        <div className="border border-gray-400 bg-white/60 backdrop-blur-sm mb-3 max-h-44 overflow-y-auto">
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
              </div>
              <div className="text-[8px] uppercase font-futura text-gray-500 mt-0.5">{t.description}</div>
              <div className="text-[7px] font-mono text-gray-400 mt-0.5">{t.type}</div>
            </button>
          ))}
        </div>

        {selectedMeta ? (
          <div className="border border-black bg-white/60 backdrop-blur-sm p-3 mb-3">
            <div className="text-[10px] uppercase font-futura text-[#EB1C24]">{selectedMeta.label}</div>
            <div className="text-[9px] uppercase font-futura text-gray-500 mt-1">{selectedMeta.description}</div>
            {previewSubject ? (
              <div className="text-[8px] uppercase font-futura text-black mt-2">
                Subject: <span className="text-gray-600">{previewSubject}</span>
              </div>
            ) : null}
            <button
              type="button"
              onClick={() => void loadPreview(selectedType)}
              disabled={previewLoading}
              className="mt-2 px-3 py-1.5 text-[9px] uppercase font-futura text-white bg-[#EB1C24]"
            >
              {previewLoading ? 'Refreshing…' : 'Refresh Preview'}
            </button>
          </div>
        ) : null}

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
              sandbox="allow-same-origin"
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
