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
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
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
    if (expandedKey) setDraftItem(emptyDraft());
    else setDraftItem(null);
  }, [expandedKey]);

  const toggleCategory = useCallback((key: string) => {
    setExpandedKey((prev) => (prev === key ? null : key));
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

  const expandedCategory = useMemo(
    () => TV_CATEGORIES.find((c) => c.key === expandedKey) ?? null,
    [expandedKey]
  );

  const handleSaveCategory = () => {
    if (!expandedCategory) return;
    const placement = getPlacement(expandedCategory.mainTab, expandedCategory.sidebarId);
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
      mainTab: expandedCategory.mainTab,
      sidebarId: expandedCategory.sidebarId,
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
        TAP A CATEGORY TO EXPAND AND MANAGE TILES. UPLOAD A PHOTO OR VIDEO, SET TITLE AND BODY, THEN SAVE.
      </p>

      <div className="space-y-2">
        {TV_CATEGORIES.map((cat) => {
          const isOpen = expandedKey === cat.key;
          const placement = getPlacement(cat.mainTab, cat.sidebarId);
          const count = placement.items.length;

          return (
            <div key={cat.key} className="border border-gray-300 rounded overflow-hidden">
              <button
                type="button"
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center justify-between px-3 py-2 text-left"
                style={{
                  backgroundColor: isOpen ? 'rgba(235,28,36,0.08)' : 'rgba(255,255,255,0.75)',
                  fontFamily: '"Futura PT Demi"',
                  fontSize: '10px',
                  color: isOpen ? '#EB1C24' : '#000',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>{cat.label}</span>
                <span style={{ color: '#808080', fontFamily: '"Futura PT Medium"' }}>
                  {isOpen ? '−' : '+'} {count}
                </span>
              </button>

              {isOpen ? (
                <div className="px-3 pb-3 pt-1 border-t border-gray-200">
                  {placement.items.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">NO ITEMS YET.</p>
                  ) : (
                    placement.items.map((item) => (
                      <ItemEditor
                        key={item.id}
                        item={item}
                        mainTab={cat.mainTab}
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
                        mainTab={cat.mainTab}
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
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
