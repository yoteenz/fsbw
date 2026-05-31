import { useCallback, useEffect, useMemo, useState } from 'react';
import ConfirmationModal from '../../../components/ConfirmationModal';
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
  touchLoungeTvAdminConfigUpdatedAt,
  upsertLoungeTvAdminPlacement,
  type LoungeTvAdminConfig,
  type LoungeTvAdminItem,
  type LoungeTvAdminMediaType,
  type LoungeTvAdminPlacement,
} from '../../../utils/loungeTvAdminConfig';
import { getLoungeTvAdminConfig, putAdminLoungeTvConfig } from '../../../utils/api';
import {
  clearLoungeTvTileViewed,
  resetLoungeTvViewedForNewAdminItems,
} from '../../../utils/loungeTvViewedTiles';

/** Inline embed limit (localStorage + JSON config); larger files must use a hosted URL. */
const MAX_INLINE_VIDEO_BYTES = 4 * 1024 * 1024;

const adminTvUppercaseStyle: React.CSSProperties = { textTransform: 'uppercase' };

/** Match admin revenue waitlist panels (`view-waitlist/page.tsx`). */
const adminHubPanelStyle: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #d1d5db',
  borderRadius: 0,
  padding: '10px',
};

const adminHubRowLabelStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '11px',
  color: '#808080',
};

const adminHubRowValueStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '11px',
  color: '#EB1C24',
};

const adminHubSectionTitleStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '10px',
  color: '#000',
  margin: 0,
  textTransform: 'uppercase',
};

function formatFileSizeMb(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileLooksLikeVideo(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('video/')) return true;
  return /\.(mp4|mov|webm|m4v)$/i.test(file.name);
}

function fileLooksLikeImage(file: File): boolean {
  const type = (file.type || '').toLowerCase();
  if (type.startsWith('image/')) return true;
  return /\.(jpg|jpeg|png|webp|gif|heic)$/i.test(file.name);
}

const VIDEO_FILE_ACCEPT = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm,.m4v';
const IMAGE_FILE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp,.heic';

const adminTvFieldStyle: React.CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  textTransform: 'uppercase',
};

const adminTvInputStyle: React.CSSProperties = {
  border: '1px solid #d1d5db',
  borderRadius: 0,
};

export type AdminLoungeTvContentPanelProps = {
  editingMainTab: LoungeTvMainTab | null;
  sidebarId: string;
  onOpenMainTab: (mainTab: LoungeTvMainTab) => void;
  onCloseEditing: () => void;
};

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
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const displayTitle = item.title.trim() ? item.title.trim().toUpperCase() : 'UNTITLED';

  const handleMediaFile = async (file: File | undefined, kind: 'media' | 'thumb') => {
    if (!file || file.size === 0) {
      setUploadError('NO FILE RECEIVED — TRY AGAIN OR PASTE A URL.');
      setUploadNotice(null);
      return;
    }
    setUploadError(null);
    setUploadNotice(null);
    const isVideo = fileLooksLikeVideo(file);
    const isImage = fileLooksLikeImage(file);
    const mediaTypeForUpload =
      kind === 'media' ? (isVideo ? 'video' : isImage ? 'image' : item.mediaType) : item.mediaType;
    if (kind === 'media' && mediaTypeForUpload === 'video' && !isVideo) {
      setUploadError(
        `NOT RECOGNIZED AS VIDEO (${file.name || 'UNNAMED'}). USE .MP4/.MOV OR PASTE A HOSTED URL.`
      );
      return;
    }
    if (kind === 'media' && mediaTypeForUpload === 'image' && !isImage) {
      setUploadError('CHOOSE AN IMAGE FILE OR PASTE A URL BELOW.');
      return;
    }
    if (kind === 'thumb' && !isImage) {
      setUploadError('THUMBNAIL MUST BE AN IMAGE.');
      return;
    }
    if (kind === 'media' && isVideo && file.size > MAX_INLINE_VIDEO_BYTES) {
      setUploadError(
        `VIDEO IS ${formatFileSizeMb(file.size)} — TOO LARGE TO EMBED (MAX ${formatFileSizeMb(MAX_INLINE_VIDEO_BYTES)}). PASTE A SUPABASE OR HOSTED URL ABOVE INSTEAD.`
      );
      return;
    }
    setUploading(true);
    try {
      const dataUrl = await readFileAsDataUrl(file);
      if (kind === 'media') {
        onChange({
          ...item,
          mediaUrl: dataUrl,
          mediaType: mediaTypeForUpload,
          thumbSrc: isImage && mediaTypeForUpload === 'image' ? dataUrl : item.thumbSrc,
        });
        setUploadNotice(
          `${isVideo ? 'VIDEO' : 'PHOTO'} ADDED: ${file.name || 'FILE'} (${formatFileSizeMb(file.size)}). TAP SAVE CATEGORY.`
        );
      } else {
        onChange({ ...item, thumbSrc: dataUrl });
        setUploadNotice(`THUMBNAIL ADDED: ${file.name || 'FILE'}. TAP SAVE CATEGORY.`);
      }
    } catch {
      setUploadError('COULD NOT READ FILE — TRY A SMALLER CLIP OR PASTE A URL.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="mb-3"
      style={{ ...adminHubPanelStyle, ...adminTvUppercaseStyle }}
    >
      <div className="flex justify-between items-start gap-2 mb-2">
        <p className="text-xs font-medium text-black" style={{ fontFamily: '"Futura PT Demi"' }}>
          {item.title.trim() ? item.title : 'UNTITLED'}
        </p>
        <button
          type="button"
          onClick={() => setShowRemoveConfirm(true)}
          className="text-xs text-red-600 shrink-0"
          style={{ fontFamily: '"Futura PT Medium"' }}
        >
          REMOVE
        </button>
      </div>

      <ConfirmationModal
        isOpen={showRemoveConfirm}
        onClose={() => setShowRemoveConfirm(false)}
        onConfirm={() => {
          setShowRemoveConfirm(false);
          onRemove();
        }}
        title="REMOVE CONTENT"
        message={`Remove "${displayTitle}" from this category? Tap SAVE CATEGORY afterward for changes to apply on the lounge TV.`}
        confirmText="REMOVE"
        cancelText="CANCEL"
        dataAttribute="lounge-tv-content-remove-confirm"
      />

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
        onChange={(e) => {
          setUploadNotice(null);
          onChange({ ...item, mediaUrl: e.target.value });
        }}
        className="w-full border border-gray-300 rounded px-2 py-1 text-xs mb-1"
        style={adminTvFieldStyle}
      />
      <label
        className="block w-full text-center py-2 mb-2 text-xs cursor-pointer"
        style={{
          fontFamily: '"Futura PT Demi"',
          backgroundColor: uploading ? '#808080' : '#EB1C24',
          color: '#fff',
          opacity: uploading ? 0.7 : 1,
        }}
      >
        {uploading
          ? 'LOADING FILE…'
          : item.mediaType === 'video'
            ? 'CHOOSE VIDEO FILE'
            : 'CHOOSE PHOTO FILE'}
        <input
          type="file"
          accept={item.mediaType === 'video' ? VIDEO_FILE_ACCEPT : IMAGE_FILE_ACCEPT}
          disabled={uploading}
          className="sr-only"
          onChange={(e) => {
            const picked = e.target.files?.[0];
            e.target.value = '';
            void handleMediaFile(picked, 'media');
          }}
        />
      </label>
      {uploadNotice ? (
        <p className="text-[10px] mb-2 px-2 py-1" style={{ color: '#166534', backgroundColor: 'rgba(34,197,94,0.12)' }}>
          {uploadNotice}
        </p>
      ) : null}
      {item.mediaUrl ? (
        <div className="mb-2">
          <p className="text-[10px] text-gray-600 mb-1 truncate">
            {item.mediaUrl.startsWith('data:')
              ? `EMBEDDED ${item.mediaType === 'video' ? 'VIDEO' : 'PHOTO'} READY`
              : item.mediaUrl}
          </p>
          {item.mediaType === 'video' && item.mediaUrl ? (
            <video
              src={item.mediaUrl}
              controls
              playsInline
              preload="metadata"
              style={{ width: '100%', maxHeight: '120px', background: '#000' }}
            />
          ) : null}
          {item.mediaType === 'image' && item.mediaUrl.startsWith('data:') ? (
            <img
              src={item.mediaUrl}
              alt=""
              style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', display: 'block' }}
            />
          ) : null}
        </div>
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
          onChange={(e) => {
            const checked = e.target.checked;
            if (checked) clearLoungeTvTileViewed(item.id);
            onChange({ ...item, isNew: checked });
          }}
        />
        SHOW *NEW* BADGE
      </label>

      {uploadError ? (
        <p className="text-xs text-red-600 mt-2 px-2 py-1" style={{ backgroundColor: 'rgba(239,68,68,0.1)' }}>
          {uploadError}
        </p>
      ) : null}
    </div>
  );
}

export default function AdminLoungeTvContentPanel({
  editingMainTab,
  sidebarId,
  onOpenMainTab,
  onCloseEditing,
}: AdminLoungeTvContentPanelProps) {
  const [config, setConfig] = useState<LoungeTvAdminConfig>(() => buildDefaultLoungeTvAdminConfig());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    if (editingMainTab) setDraftItem(emptyDraft());
    else setDraftItem(null);
  }, [editingMainTab, sidebarId]);

  const closeCategory = useCallback(() => {
    onCloseEditing();
    setDraftItem(null);
    setFeedback(null);
  }, [onCloseEditing]);

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
      const stamped = touchLoungeTvAdminConfigUpdatedAt(next);
      resetLoungeTvViewedForNewAdminItems(
        stamped.placements.flatMap((placement) => placement.items)
      );
      saveLoungeTvAdminConfigToStorage(stamped);
      setConfig(stamped);
      try {
        await putAdminLoungeTvConfig(stamped as unknown as Record<string, unknown>);
        setFeedback({ type: 'success', msg: 'CONTENT SAVED.' });
      } catch (e) {
        const detail = (e instanceof Error ? e.message : 'SAVE FAILED').toUpperCase();
        const forbidden = /FORBIDDEN|403|ADMIN ACCESS DENIED/i.test(detail);
        setFeedback({
          type: 'error',
          msg: forbidden
            ? `SAVED ON THIS DEVICE — SERVER SYNC DENIED (${detail}). SIGN OUT AND SIGN IN WITH YOUR ADMIN SUPABASE EMAIL, THEN SAVE AGAIN. LOUNGE TV ON THIS PHONE USES THE LOCAL COPY.`
            : `SAVED ON THIS DEVICE — SERVER SYNC FAILED (${detail}). TV USES THIS DEVICE COPY; FOR OTHER DEVICES USE A HOSTED HTTPS VIDEO URL.`,
        });
      } finally {
        setSaving(false);
      }
    },
    []
  );

  const editingMainTabLabel = useMemo(
    () => LOUNGE_TV_MAIN_TABS.find((t) => t.id === editingMainTab)?.label ?? '',
    [editingMainTab]
  );

  const totalItemsAll = useMemo(
    () =>
      LOUNGE_TV_MAIN_TABS.reduce((sum, tab) => {
        const sidebars = LOUNGE_TV_SIDEBAR[tab.id] ?? [];
        return (
          sum +
          sidebars.reduce(
            (inner, sidebar) => inner + getPlacement(tab.id, sidebar.id).items.length,
            0
          )
        );
      }, 0),
    [getPlacement]
  );

  const handleSaveCategory = () => {
    if (!editingMainTab || !sidebarId) return;
    const placement = getPlacement(editingMainTab, sidebarId);
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
      mainTab: editingMainTab,
      sidebarId,
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

  if (editingMainTab && sidebarId) {
    const placement = getPlacement(editingMainTab, sidebarId);
    const activeSidebarLabel =
      LOUNGE_TV_SIDEBAR[editingMainTab]?.find((s) => s.id === sidebarId)?.label ?? sidebarId;

    return (
      <div className="flex flex-col flex-1 min-h-0" style={adminTvUppercaseStyle}>
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
              {editingMainTabLabel}
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
              fontSize: '10px',
            }}
          >
            {feedback.msg}
          </div>
        ) : null}

        <p
          style={{
            fontFamily: '"Futura PT Book"',
            fontSize: '9px',
            color: '#808080',
            margin: '0 0 8px 0',
            lineHeight: 1.4,
            flexShrink: 0,
          }}
        >
          EDITING {activeSidebarLabel}. TAP SAVE CATEGORY AFTER CHANGES.
        </p>

        <div
          className="flex-1 min-h-0 overflow-y-auto admin-hub-tab-scroll"
          style={{ paddingTop: '4px' }}
        >
          {placement.items.length === 0 ? (
            <p className="text-xs text-gray-500 py-2">NO ITEMS YET.</p>
          ) : (
            placement.items.map((item) => (
              <ItemEditor
                key={item.id}
                item={item}
                mainTab={editingMainTab}
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
            <div
              className="mt-2"
              style={{
                ...adminHubPanelStyle,
                borderStyle: 'dashed',
              }}
            >
              <p className="text-xs mb-2" style={{ fontFamily: '"Futura PT Demi"', color: '#808080' }}>
                ADD NEW
              </p>
              <ItemEditor
                item={draftItem}
                mainTab={editingMainTab}
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
    <div style={adminTvUppercaseStyle}>
      {feedback ? (
        <div
          className="mb-3 px-3 py-2 shrink-0"
          style={{
            backgroundColor: feedback.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            color: feedback.type === 'success' ? '#166534' : '#b91c1c',
            fontSize: '10px',
          }}
        >
          {feedback.msg}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4" style={{ marginTop: '12px' }}>
        <div
          className="text-center py-3"
          style={{
            backgroundColor: 'rgba(0,0,0,0.04)',
            borderRadius: '4px',
          }}
        >
          <p
            style={{
              fontFamily: '"Covered By Your Grace", cursive',
              fontSize: '22px',
              color: '#000',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {LOUNGE_TV_MAIN_TABS.length}
          </p>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              color: '#808080',
              margin: '4px 0 0 0',
            }}
          >
            CATEGORIES
          </p>
        </div>
        <div
          className="text-center py-3"
          style={{
            backgroundColor: 'rgba(0,0,0,0.04)',
            borderRadius: '4px',
          }}
        >
          <p
            style={{
              fontFamily: '"Covered By Your Grace", cursive',
              fontSize: '22px',
              color: '#EB1C24',
              margin: 0,
              lineHeight: 1,
            }}
          >
            {totalItemsAll}
          </p>
          <p
            style={{
              fontFamily: '"Futura PT Medium"',
              fontSize: '9px',
              color: '#808080',
              margin: '4px 0 0 0',
            }}
          >
            ITEMS
          </p>
        </div>
      </div>

      <p
        style={{
          fontFamily: '"Futura PT Book"',
          fontSize: '9px',
          color: '#808080',
          margin: '12px 0 0 0',
          lineHeight: 1.4,
        }}
      >
        TAP A CATEGORY TO EDIT LOUNGE TV TILES AND VIDEOS. USE SUB-TABS TO SWITCH SIDEBARS.
      </p>

      <div className="space-y-3" style={{ marginTop: '12px' }}>
        <div style={adminHubPanelStyle}>
          <p style={adminHubSectionTitleStyle}>LOUNGE TV</p>
          <div>
            {LOUNGE_TV_MAIN_TABS.map((tab) => {
              const sidebars = LOUNGE_TV_SIDEBAR[tab.id] ?? [];
              const totalItems = sidebars.reduce(
                (sum, sidebar) => sum + getPlacement(tab.id, sidebar.id).items.length,
                0
              );
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onOpenMainTab(tab.id)}
                  className="w-full flex justify-between items-center cursor-pointer hover:bg-black/[0.04]"
                  style={{
                    border: 'none',
                    borderBottom: '1px solid #e5e7eb',
                    background: 'none',
                    padding: '8px 0',
                    margin: 0,
                  }}
                >
                  <span style={adminHubRowLabelStyle}>{tab.label}</span>
                  <span style={adminHubRowValueStyle}>{totalItems}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
