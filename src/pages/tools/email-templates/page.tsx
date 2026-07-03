import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { canAccessAdminPages } from '../../../utils/adminAuth';
import {
  EMAIL_PREVIEW_SAMPLE_VARIABLES,
  EMAIL_TEMPLATE_CATEGORIES,
  type EmailTemplateCategoryId,
} from '../../../constants/emailTemplateCatalog';
import { previewEmailTemplate } from '../../../utils/transactionalEmail';

const CATEGORY_TABS: Array<{ id: EmailTemplateCategoryId; label: string }> = [
  { id: 'account', label: 'ACCOUNT' },
  { id: 'orders', label: 'ORDERS' },
  { id: 'rewards', label: 'REWARDS' },
  { id: 'affiliate', label: 'AFFILIATE' },
  { id: 'shop', label: 'SHOP' },
];

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

  useEffect(() => {
    if (!canAccessAdminPages()) {
      navigate('/account', { replace: true });
    }
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
    if (!selectedType) return;
    void loadPreview(selectedType);
  }, [selectedType, loadPreview]);

  const handleCategoryChange = (id: EmailTemplateCategoryId) => {
    setActiveCategory(id);
    const cat = categories.find((c) => c.id === id);
    const first = cat?.templates[0]?.type;
    if (first) setSelectedType(first);
  };

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
            Preview Frontal Slayer transactional emails with Fal-generated hero scenes from your reference boards.
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
