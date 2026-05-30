import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  LOUNGE_TV_MAIN_TABS,
  LOUNGE_TV_SIDEBAR,
  type LoungeTvMainTab,
} from '../../../components/lounge/loungeTvContent';
import {
  buildDefaultLoungeTvAdminConfig,
  getLoungeTvAdminPlacement,
  hydrateLoungeTvAdminConfig,
  saveLoungeTvAdminConfigToStorage,
  upsertLoungeTvAdminPlacement,
  type LoungeTvAdminConfig,
  type LoungeTvAdminItem,
  type LoungeTvAdminMediaType,
  type LoungeTvAdminPlacement,
} from '../../../utils/loungeTvAdminConfig';
import { getLoungeTvAdminConfig, putAdminLoungeTvConfig } from '../../../utils/api';

const MAX_INLINE_VIDEO_BYTES = 4 * 1024 * 1024;

const adminTvUppercaseStyle: React.CSSProperties = { textTransform: 'uppercase' };

const adminTvFieldStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  textTransform: 'uppercase',
};

type TvCategory = {
  key: string;
  mainTab: LoungeTvMainTab;
  sidebarId: string;
  label: string;
};

function buildTvCategories(): TvCategory[] {
  const rows: TvCategory[] = [];
  for (const tab of LOUNGE_TV_MAIN_TABS) {
    const sidebars = LOUNGE_TV_SIDEBAR[tab.id] ?? [];
    for (const sidebar of sidebars) {
      rows.push({
        key: `${tab.id}:${sidebar.id}`,
        mainTab: tab.id,
        sidebarId: sidebar.id,
        label: `${tab.label} · ${sidebar.label}`,
      });
    }
  }
  return rows;
}

const TV_CATEGORIES = buildTvCategories();

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

function newItemId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const emptyDraft = (): LoungeTvAdminItem => ({
  id: newItemId(),
  title: '',
  body: '',
  mediaType: 'image',
  mediaUrl: '',
  thumbSrc: undefined,
  isNew: false,
  durationLabel: '4:32',
});

type ItemEditorProps = {
  item: LoungeTvAdminItem;
  mainTab: LoungeTvMainTab;
  onChange: (item: LoungeTvAdminItem) => void;
  onRemove: () => void;
};

function ItemEditor({ item, mainTab, onChange, onRemove }: ItemEditorProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleMediaFile = async (file: File | undefined, kind: 'media' | 'thumb') => {
    if (!file) return;
    setUploadError(null);
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (kind === 'media' && item.mediaType === 'video' && !isVideo) {
      setUploadError('CHOOSE A VIDEO FILE OR PASTE A URL BELOW.');
      return;
    }
    if (kind === 'media' && item.mediaType === 'image' && !isImage) {
      setUploadError('CHOOSE AN IMAGE FILE OR PASTE A URL BELOW.');
      return;
    }
    if (kind === 'thumb' && !isImage) {
      setUploadError('THUMBNAIL MUST BE AN IMAGE.');
      return;
    }
    if (isVideo && file.size > MAX_INLINE_VIDEO_BYTES) {
      setUploadError('VIDEO IS TOO LARGE TO EMBED. PASTE A HOSTED URL INSTEAD (MAX ~4MB FOR UPLOAD).');
      return;
    }
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (kind === 'media') {
        onChange({
          ...item,
          mediaUrl: dataUrl,
          mediaType: isVideo ? 'video' : 'image',
          thumbSrc: isImage ? dataUrl : item.thumbSrc,
        });
      } else {
        onChange({ ...item, thumbSrc: dataUrl });
      }
    } catch {
      setUploadError('COULD NOT READ FILE.');
    }
  };

  return (
    <div
      className="border border-gray-300 rounded p-3 mb-3"
      style={{ backgroundColor: 'rgba(255,255,255,0.85)', ...adminTvUppercaseStyle }}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="text-xs font-medium text-black" style={{ fontFamily: '"Futura PT Demi"' }}>
          {item.title.trim() ? item.title : 'UNTITLED'}
        </p>
        <button
          type="button"
          onClick={onRemove}
          className="text-xs text-red-600 shrink-0"
          style={{ fontFamily: '"Futura PT Medium"' }}
        >
          REMOVE
        </button>
      </div>

      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: '"Futura PT Medium"' }}>
        TITLE
      </label>
      <input
        type="text"
        value={item.title}
        onChange={(e) => onChange({ ...item, title: e.target.value.toUpperCase() })}
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2"
        style={adminTvFieldStyle}
      />

      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: '"Futura PT Medium"' }}>
        BODY / DESCRIPTION
      </label>
      <textarea
        value={item.body}
        onChange={(e) => onChange({ ...item, body: e.target.value.toUpperCase() })}
        rows={3}
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2 resize-y"
        style={adminTvFieldStyle}
      />

      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: '"Futura PT Medium"' }}>
        MEDIA TYPE
      </label>
      <div className="flex gap-3 mb-2">
        {(['image', 'video'] as LoungeTvAdminMediaType[]).map((type) => (
          <label key={type} className="flex items-center gap-1 text-xs cursor-pointer" style={{ fontFamily: '"Futura PT Medium"' }}>
            <input
              type="radio"
              name={`media-${item.id}`}
              checked={item.mediaType === type}
              onChange={() => onChange({ ...item, mediaType: type })}
            />
            {type === 'image' ? 'PHOTO' : 'VIDEO'}
          </label>
        ))}
      </div>

      <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: '"Futura PT Medium"' }}>
        {item.mediaType === 'video' ? 'VIDEO URL OR UPLOAD' : 'PHOTO URL OR UPLOAD'}
      </label>
      <input
        type="text"
        value={item.mediaUrl.startsWith('data:') ? '' : item.mediaUrl}
        placeholder={item.mediaType === 'video' ? 'HTTPS://…' : 'HTTPS://… OR UPLOAD BELOW'}
        onChange={(e) => onChange({ ...item, mediaUrl: e.target.value })}
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1"
        style={adminTvFieldStyle}
      />
      <input
        type="file"
        accept={item.mediaType === 'video' ? 'video/*' : 'image/*'}
        className="text-xs mb-2 w-full"
        onChange={(e) => {
          void handleMediaFile(e.target.files?.[0], 'media');
          e.target.value = '';
        }}
      />
      {item.mediaUrl ? (
        <p className="text-[10px] text-gray-500 mb-2 truncate">
          {item.mediaUrl.startsWith('data:') ? 'MEDIA ATTACHED (EMBEDDED)' : item.mediaUrl}
        </p>
      ) : null}

      {item.mediaType === 'video' ? (
        <>
          <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: '"Futura PT Medium"' }}>
            THUMBNAIL (OPTIONAL)
          </label>
          <input
            type="file"
            accept="image/*"
            className="text-xs mb-2 w-full"
            onChange={(e) => {
              void handleMediaFile(e.target.files?.[0], 'thumb');
              e.target.value = '';
            }}
          />
          {mainTab === 'watch-learn' ? (
            <>
              <label className="block text-xs text-gray-600 mb-1" style={{ fontFamily: '"Futura PT Medium"' }}>
                DURATION (E.G. 4:32)
              </label>
              <input
                type="text"
                value={item.durationLabel ?? ''}
                onChange={(e) => onChange({ ...item, durationLabel: e.target.value.toUpperCase() })}
                className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-2"
                style={adminTvFieldStyle}
              />
            </>
          ) : null}
        </>
      ) : null}

      <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ fontFamily: '"Futura PT Medium"' }}>
        <input
          type="checkbox"
          checked={Boolean(item.isNew)}
          onChange={(e) => onChange({ ...item, isNew: e.target.checked })}
        />
        SHOW *NEW* BADGE
      </label>

      {uploadError ? <p className="text-xs text-red-600 mt-2">{uploadError}</p> : null}
    </div>
  );
}

export default function AdminLoungeTvContentPanel() {
  const [config, setConfig] = useState<LoungeTvAdminConfig>(() => buildDefaultLoungeTvAdminConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [draftItem, setDraftItem] = useState<LoungeTvAdminItem | null>(null);

  useEffect(() => {
    let cancelled = false;
    void hydrateLoungeTvAdminConfig(getLoungeTvAdminConfig).then((loaded) => {
      if (!cancelled) {
        setConfig(loaded);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedCategoryKey) setDraftItem(emptyDraft());
    else setDraftItem(null);
  }, [selectedCategoryKey]);

  const openCategory = useCallback((key: string) => {
    setSelectedCategoryKey(key);
    setFeedback(null);
  }, []);

  const closeCategory = useCallback(() => {
    setSelectedCategoryKey(null);
    setDraftItem(null);
    setFeedback(null);
  }, []);

  const getPlacement = useCallback(
    (mainTab: LoungeTvMainTab, sidebarId: string): LoungeTvAdminPlacement => {
      return (
        getLoungeTvAdminPlacement(config, mainTab, sidebarId) ?? {
          mainTab,
          sidebarId,
          items: [],
        }
      );
    },
    [config]
  );

  const updatePlacement = useCallback((placement: LoungeTvAdminPlacement) => {
    setConfig((prev) => upsertLoungeTvAdminPlacement(prev, placement));
  }, []);

  const saveConfig = useCallback(
    async (next: LoungeTvAdminConfig) => {
      setSaving(true);
      setFeedback(null);
      try {
        saveLoungeTvAdminConfigToStorage(next);
        setConfig(next);
        await putAdminLoungeTvConfig(next as unknown as Record<string, unknown>);
        setFeedback({ type: 'success', msg: 'CONTENT SAVED.' });
      } catch (e) {
        setFeedback({
          type: 'error',
          msg: (e instanceof Error ? e.message : 'SAVE FAILED').toUpperCase(),
        });
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const selectedCategory = useMemo(
    () => TV_CATEGORIES.find((c) => c.key === selectedCategoryKey) ?? null,
    [selectedCategoryKey]
  );

  const handleSaveCategory = () => {
    if (!selectedCategory) return;
    const placement = getPlacement(selectedCategory.mainTab, selectedCategory.sidebarId);
    let items = [...placement.items];
    if (draftItem && draftItem.title.trim()) {
      items = [
        ...items,
        {
          ...draftItem,
          title: draftItem.title.trim().toUpperCase(),
          body: draftItem.body.toUpperCase(),
        },
      ];
      setDraftItem(null);
    }
    const nextPlacement: LoungeTvAdminPlacement = {
      mainTab: selectedCategory.mainTab,
      sidebarId: selectedCategory.sidebarId,
      items,
    };
    const next = upsertLoungeTvAdminPlacement(config, nextPlacement);
    void saveConfig(next);
  };

  if (loading) {
    return (
      <p className="py-6 text-gray-500 text-sm" style={adminTvUppercaseStyle}>
        LOADING TV CONTENT…
      </p>
    );
  }

  if (selectedCategory) {
    const placement = getPlacement(selectedCategory.mainTab, selectedCategory.sidebarId);

    return (
      <div className="mt-2 flex flex-col min-h-0" style={adminTvUppercaseStyle}>
        <div className="flex-shrink-0 pb-2">
          <div className="flex items-center justify-between" style={{ minWidth: 0 }}>
            <h2
              style={{
                fontFamily: '"Futura PT Medium"',
                color: '#EB1C24',
                fontSize: '12px',
                fontWeight: 500,
                margin: 0,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minWidth: 0,
                flex: '1 1 auto',
                maxWidth: 'calc(100% - 24px)',
                paddingRight: '8px',
              }}
            >
              {selectedCategory.label}
            </h2>
            <button
              type="button"
              onClick={closeCategory}
              aria-label="Close category content"
              style={{
                padding: 0,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                lineHeight: 0,
                flexShrink: 0,
              }}
            >
              <img src="/assets/close-icon.svg" alt="" width={16} height={16} style={{ display: 'block' }} />
            </button>
          </div>
          <div style={{ borderBottom: '1px solid #d1d5db', marginTop: '8px' }} />
        </div>

        {feedback ? (
          <div
            className="mb-3 px-3 py-2 text-sm shrink-0"
            style={{
              backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
              color: feedback.type === 'success' ? '#166534' : '#b91c1c',
            }}
          >
            {feedback.msg}
          </div>
        ) : null}

        <div className="min-h-0 overflow-y-auto" style={{ paddingTop: '4px' }}>
          {placement.items.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">NO ITEMS YET.</p>
          ) : (
            placement.items.map((item) => (
              <ItemEditor
                key={item.id}
                item={item}
                mainTab={selectedCategory.mainTab}
                onChange={(updated) => {
                  const items = placement.items.map((row) => (row.id === item.id ? updated : row));
                  updatePlacement({ ...placement, items });
                }}
                onRemove={() => {
                  updatePlacement({
                    ...placement,
                    items: placement.items.filter((row) => row.id !== item.id),
                  });
                }}
              />
            ))
          )}

          {draftItem ? (
            <div className="border border-dashed border-gray-400 rounded p-3 mt-2">
              <p className="text-xs mb-2" style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}>
                ADD NEW
              </p>
              <ItemEditor
                item={draftItem}
                mainTab={selectedCategory.mainTab}
                onChange={setDraftItem}
                onRemove={() => setDraftItem(emptyDraft())}
              />
            </div>
          ) : null}

          <button
            type="button"
            disabled={saving}
            onClick={handleSaveCategory}
            className="w-full mt-3 py-2 text-xs text-white rounded disabled:opacity-50"
            style={{ backgroundColor: '#EB1C24', fontFamily: '"Futura PT Demi"' }}
          >
            {saving ? 'SAVING…' : 'SAVE CATEGORY'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2" style={adminTvUppercaseStyle}>
      {feedback ? (
        <div
          className="mb-3 px-3 py-2 text-sm"
          style={{
            backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: feedback.type === 'success' ? '#166534' : '#b91c1c',
          }}
        >
          {feedback.msg}
        </div>
      ) : null}

      <p className="text-xs text-gray-600 mb-3" style={{ fontFamily: '"Futura PT Medium"', lineHeight: 1.4 }}>
        TAP A CATEGORY TO MANAGE TILES. UPLOAD A PHOTO OR VIDEO, SET TITLE AND BODY, THEN SAVE.
      </p>

      <div className="space-y-3">
        {LOUNGE_TV_MAIN_TABS.map((tab) => {
          const sectionCategories = TV_CATEGORIES.filter((c) => c.mainTab === tab.id);
          if (sectionCategories.length === 0) return null;

          return (
            <div
              key={tab.id}
              className="border border-gray-300 rounded"
              style={{ backgroundColor: 'rgba(255,255,255,0.85)', padding: '10px' }}
            >
              <p
                style={{
                  fontFamily: '"Futura PT Demi"',
                  fontSize: '10px',
                  color: '#000',
                  margin: '0 0 8px 0',
                }}
              >
                {tab.label}
              </p>
              <div>
                {sectionCategories.map((cat) => {
                  const placement = getPlacement(cat.mainTab, cat.sidebarId);
                  const count = placement.items.length;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => openCategory(cat.key)}
                      className="w-full flex justify-between items-center cursor-pointer hover:bg-black/[0.04]"
                      style={{
                        border: 'none',
                        borderBottom: '1px solid #e5e7eb',
                        background: 'none',
                        padding: '8px 0',
                        margin: 0,
                        textAlign: 'left',
                      }}
                    >
                      <span
                        style={{
                          fontFamily: '"Futura PT Medium"',
                          fontSize: '11px',
                          color: '#808080',
                        }}
                      >
                        {LOUNGE_TV_SIDEBAR[cat.mainTab]?.find((s) => s.id === cat.sidebarId)?.label ?? cat.sidebarId}
                      </span>
                      <span
                        style={{
                          fontFamily: '"Futura PT Book"',
                          fontSize: '11px',
                          color: '#EB1C24',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
