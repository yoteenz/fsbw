import { useMemo, useState, type ChangeEvent, type CSSProperties } from 'react';
import { useDebugMode } from './DebugModeProvider';
import {
  DEBUG_MODE_SESSION_KEY,
  DEBUG_BRAND_COLORS,
  DEBUG_FONT_PRESET_OPTIONS,
  debugFontPresetPatch,
} from '../../utils/debugMode';
import { findElementByDebugId, readElementOverrideSnapshot } from '../../utils/debugModeDomPath';
import {
  formatGlobalOverlayConfigForCopy,
  listGlobalOverlayLabels,
  overlayHasSavedLayout,
  useGlobalOverlayDebug,
} from './GlobalOverlayDebugContext';

const btn: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  padding: '4px 8px',
  border: '1px solid rgba(0,0,0,0.35)',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
};

const fieldLabel: CSSProperties = {
  display: 'block',
  marginBottom: 2,
  opacity: 0.75,
};

const inputStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  fontFamily: 'monospace',
  fontSize: 10,
  padding: '4px 6px',
  border: '1px solid rgba(0,0,0,0.35)',
  borderRadius: 4,
};

export function DebugModeOverlay() {
  const debug = useDebugMode();
  const globalOverlay = useGlobalOverlayDebug();
  const [expanded, setExpanded] = useState(true);
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [globalSectionOpen, setGlobalSectionOpen] = useState(true);

  const selectedOverride = useMemo(() => {
    if (!debug?.selectedId) return null;
    return debug.getElementOverride(debug.selectedId) ?? null;
  }, [debug, debug?.selectedId, debug?.draft.elements]);

  if (!debug?.enabled) return null;

  const status = debug.hasUnsavedChanges ? 'Unsaved' : debug.hasSavedConfig ? 'Saved' : 'Defaults';

  const patchSelected = (patch: Parameters<typeof debug.patchElement>[1]) => {
    if (!debug.selectedId) return;
    debug.patchElement(debug.selectedId, patch);
    const el = findElementByDebugId(document.body, debug.selectedId);
    if (el instanceof HTMLElement) {
      if (patch.text != null && el.children.length === 0) el.textContent = patch.text;
      if (patch.color) el.style.color = patch.color;
      if (patch.fontSize != null) el.style.fontSize = `${patch.fontSize}px`;
      if (patch.fontWeight != null) el.style.fontWeight = String(patch.fontWeight);
      if (patch.fontFamily) el.style.fontFamily = patch.fontFamily;
      if (patch.textTransform) el.style.textTransform = patch.textTransform;
      if (patch.backgroundColor) el.style.backgroundColor = patch.backgroundColor;
      if (patch.minHeight != null) el.style.minHeight = `${patch.minHeight}px`;
      if (patch.imageSrc && el.tagName === 'IMG') (el as HTMLImageElement).src = patch.imageSrc;
    }
  };

  const onImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !debug.selectedId) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') patchSelected({ imageSrc: reader.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const resyncFromDom = () => {
    if (!debug.selectedId) return;
    const el = findElementByDebugId(document.body, debug.selectedId);
    if (el instanceof HTMLElement) {
      debug.patchElement(debug.selectedId, readElementOverrideSnapshot(el));
    }
  };

  const toolbar = (
    <div data-baw-debug-ui style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
      <span style={{ fontWeight: 700 }}>Page debug</span>
      <span style={{ padding: '2px 6px', borderRadius: 999, background: debug.hasUnsavedChanges ? '#ffe08a' : '#eee' }}>
        {status}
      </span>
      <button type="button" style={btn} onClick={() => void debug.savePage()}>
        Save page
      </button>
      <button type="button" style={btn} onClick={() => void debug.resetPage()}>
        Reset page
      </button>
      <button type="button" style={btn} onClick={() => void debug.copyPageJson()}>
        Copy JSON
      </button>
      <button
        type="button"
        style={btn}
        onClick={() => {
          sessionStorage.removeItem(DEBUG_MODE_SESSION_KEY);
          window.location.assign(debug.pageKey + window.location.search + window.location.hash);
        }}
      >
        Exit debug
      </button>
      <button type="button" style={btn} onClick={() => setInspectorOpen((v) => !v)}>
        {inspectorOpen ? 'Hide inspector' : 'Show inspector'}
      </button>
      <button type="button" style={btn} onClick={() => setExpanded((v) => !v)}>
        {expanded ? 'Minimize ▴' : 'Expand ▾'}
      </button>
    </div>
  );

  if (!expanded) {
    return (
      <div
        data-baw-debug-ui
        style={{
          position: 'fixed',
          top: 8,
          left: 8,
          zIndex: 999998,
          padding: '6px 8px',
          background: 'rgba(255,255,255,0.96)',
          border: '1px solid rgba(0,0,0,0.35)',
          borderRadius: 6,
          boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
          maxWidth: 'calc(100vw - 16px)',
        }}
      >
        {toolbar}
      </div>
    );
  }

  return (
    <div
      data-baw-debug-ui
      style={{
        position: 'fixed',
        top: 8,
        left: 8,
        zIndex: 999998,
        width: 'min(360px, calc(100vw - 16px))',
        maxHeight: 'min(420px, calc(100vh - 16px))',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 10px',
        background: 'rgba(255,255,255,0.96)',
        border: '1px solid rgba(0,0,0,0.35)',
        borderRadius: 6,
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
        fontFamily: 'monospace',
        fontSize: 10,
        lineHeight: 1.4,
        overflow: 'hidden',
      }}
    >
      {toolbar}
      <p style={{ margin: '8px 0 0 0' }}>
        Tap any card, text, or image to select. Drag to nudge (4px grid). Drag tabs horizontally to swap order.
        Save syncs to Supabase for cross-device founder preview.
      </p>
      <p style={{ margin: '4px 0 0 0', opacity: 0.85 }}>Route: {debug.pageKey}</p>

      {globalSectionOpen ? (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid rgba(0,0,0,0.15)',
          }}
        >
          <p style={{ margin: '0 0 6px 0', fontWeight: 700 }}>Global overlays</p>
          <p style={{ margin: '0 0 6px 0', opacity: 0.85 }}>
            Cart dropdown + currency exchange persist on every route (`__global__/…` keys). Open the overlay, drag
            corners to resize, drag body to nudge. Save syncs with page debug store.
          </p>
          {listGlobalOverlayLabels().map(({ id, label }) => {
            const isEditing = globalOverlay?.editingOverlayId === id;
            const hasSaved = overlayHasSavedLayout(id);
            return (
              <div key={id} style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                <button
                  type="button"
                  style={{ ...btn, ...(isEditing ? { background: '#ffe08a' } : {}) }}
                  onClick={() => {
                    if (id === 'cart-dropdown') globalOverlay?.openCartForEdit();
                    else globalOverlay?.openCurrencyForEdit();
                  }}
                >
                  Edit {label}
                </button>
                <button
                  type="button"
                  style={btn}
                  disabled={!hasSaved}
                  onClick={() => void globalOverlay?.saveOverlay(id)}
                >
                  Save {label.split(' ')[0].toLowerCase()}
                </button>
                <button
                  type="button"
                  style={btn}
                  disabled={!hasSaved}
                  onClick={() => {
                    if (window.confirm(`Reset saved layout for ${label}?`)) {
                      void globalOverlay?.resetOverlay(id);
                    }
                  }}
                >
                  Reset
                </button>
                <button
                  type="button"
                  style={btn}
                  onClick={() => void navigator.clipboard.writeText(formatGlobalOverlayConfigForCopy(id))}
                >
                  Copy JSON
                </button>
                {hasSaved ? (
                  <span style={{ alignSelf: 'center', opacity: 0.7 }}>saved</span>
                ) : (
                  <span style={{ alignSelf: 'center', opacity: 0.5 }}>defaults</span>
                )}
              </div>
            );
          })}
        </div>
      ) : null}
      <button type="button" style={{ ...btn, marginTop: 6 }} onClick={() => setGlobalSectionOpen((v) => !v)}>
        {globalSectionOpen ? 'Hide global overlays ▴' : 'Show global overlays ▾'}
      </button>

      {inspectorOpen ? (
        <div style={{ marginTop: 8, overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {!debug.selectedId ? (
            <p style={{ margin: 0, opacity: 0.7 }}>No selection — tap an element on the page.</p>
          ) : (
            <>
              <p style={{ margin: '0 0 6px 0', wordBreak: 'break-all' }}>id: {debug.selectedId}</p>
              <button type="button" style={{ ...btn, marginBottom: 8 }} onClick={resyncFromDom}>
                Read from DOM
              </button>

              <label style={fieldLabel}>
                Text
                <textarea
                  style={{ ...inputStyle, minHeight: 48, resize: 'vertical' }}
                  value={selectedOverride?.text ?? ''}
                  onChange={(e) => patchSelected({ text: e.target.value })}
                />
              </label>

              <div style={{ display: 'flex', gap: 4, margin: '6px 0' }}>
                {(['red', 'gray', 'black'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    style={{ ...btn, color: DEBUG_BRAND_COLORS[key], fontWeight: 700 }}
                    onClick={() => patchSelected({ color: DEBUG_BRAND_COLORS[key] })}
                  >
                    {key.toUpperCase()}
                  </button>
                ))}
              </div>

              <label style={fieldLabel}>
                Color
                <input
                  style={inputStyle}
                  value={selectedOverride?.color ?? ''}
                  onChange={(e) => patchSelected({ color: e.target.value })}
                />
              </label>

              <p style={{ margin: '6px 0 4px 0', opacity: 0.75 }}>Fonts</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
                {DEBUG_FONT_PRESET_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    style={btn}
                    onClick={() => patchSelected(debugFontPresetPatch(option.id))}
                    title={
                      option.textTransform === 'lowercase'
                        ? 'Lowercase only'
                        : option.textTransform === 'uppercase'
                          ? 'Uppercase only'
                          : undefined
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginTop: 6 }}>
                <label style={fieldLabel}>
                  Size (px)
                  <input
                    style={inputStyle}
                    type="number"
                    value={selectedOverride?.fontSize ?? ''}
                    onChange={(e) => patchSelected({ fontSize: Number(e.target.value) || undefined })}
                  />
                </label>
                <label style={fieldLabel}>
                  Weight
                  <input
                    style={inputStyle}
                    value={selectedOverride?.fontWeight ?? ''}
                    onChange={(e) => patchSelected({ fontWeight: e.target.value || undefined })}
                  />
                </label>
                <label style={fieldLabel}>
                  Min height
                  <input
                    style={inputStyle}
                    type="number"
                    value={selectedOverride?.minHeight ?? ''}
                    onChange={(e) => patchSelected({ minHeight: Number(e.target.value) || undefined })}
                  />
                </label>
                <label style={fieldLabel}>
                  Pad (px)
                  <input
                    style={inputStyle}
                    type="number"
                    value={selectedOverride?.paddingTop ?? ''}
                    onChange={(e) => {
                      const v = Number(e.target.value) || 0;
                      patchSelected({ paddingTop: v, paddingRight: v, paddingBottom: v, paddingLeft: v });
                    }}
                  />
                </label>
              </div>

              <label style={{ ...fieldLabel, marginTop: 6 }}>
                Background
                <input
                  style={inputStyle}
                  value={selectedOverride?.backgroundColor ?? ''}
                  onChange={(e) => patchSelected({ backgroundColor: e.target.value })}
                />
              </label>

              <label style={{ ...fieldLabel, marginTop: 6 }}>
                Image upload
                <input style={{ ...inputStyle, padding: 2 }} type="file" accept="image/*" onChange={onImageUpload} />
              </label>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
