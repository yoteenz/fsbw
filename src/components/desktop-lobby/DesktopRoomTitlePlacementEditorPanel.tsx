import { useState, type CSSProperties } from 'react';
import { DESKTOP_ROOM_TITLES } from '../../constants/desktopRoomTitles';
import {
  clampDesktopRoomTitleTextScale,
  roundDesktopRoomTitleTextScale,
  resolveDesktopRoomTitleLineTextScale,
} from '../../constants/desktopRoomTitleTextScale';
import {
  useDesktopRoomTitleDebugEnabled,
  useDesktopRoomTitleEditEnabled,
  useDesktopRoomTitleViewportProfile,
} from '../../utils/desktopRoomTitlePlacementDebug';
import { useDesktopRoomTitlePlacementEditor } from './DesktopRoomTitlePlacementEditorContext';

const panelButtonStyle: CSSProperties = {
  fontFamily: 'monospace',
  fontSize: 10,
  padding: '4px 8px',
  border: '1px solid rgba(0,0,0,0.35)',
  borderRadius: 4,
  background: '#fff',
  cursor: 'pointer',
};

function patchLineTextScale(
  editor: NonNullable<ReturnType<typeof useDesktopRoomTitlePlacementEditor>>,
  zoneId: string,
  line: 'title' | 'subtitle',
  nextEffectiveScale: number,
) {
  const placement = editor.getPlacement(zoneId);
  const master = placement.textScale ?? 1;
  const clampedEffective = clampDesktopRoomTitleTextScale(nextEffectiveScale);
  const lineScale = master > 0 ? clampedEffective / master : clampedEffective;
  const patch =
    line === 'title'
      ? { titleTextScale: roundDesktopRoomTitleTextScale(lineScale) }
      : { subtitleTextScale: roundDesktopRoomTitleTextScale(lineScale) };
  editor.patchPlacement(zoneId, patch);
}

function ScaleStepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <span style={{ minWidth: 58 }}>{label}</span>
      <button type="button" style={panelButtonStyle} onClick={onDecrease} aria-label={`Decrease ${label}`}>
        −
      </button>
      <span style={{ minWidth: 44, textAlign: 'center' }}>{value.toFixed(2)}×</span>
      <button type="button" style={panelButtonStyle} onClick={onIncrease} aria-label={`Increase ${label}`}>
        +
      </button>
    </div>
  );
}

const shellStyle: CSSProperties = {
  position: 'fixed',
  bottom: 8,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 100002,
  fontFamily: 'monospace',
  fontSize: 10,
  lineHeight: 1.4,
  color: '#000',
  background: 'rgba(255, 255, 255, 0.96)',
  border: '1px solid rgba(0, 0, 0, 0.35)',
  borderRadius: 6,
  boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
  pointerEvents: 'auto',
};

/** QA panel for draggable room label squares (`?roomTitleDebug=1&roomTitleEdit=1`). */
export function DesktopRoomTitlePlacementEditorPanel() {
  const debugEnabled = useDesktopRoomTitleDebugEnabled();
  const editEnabled = useDesktopRoomTitleEditEnabled();
  const profile = useDesktopRoomTitleViewportProfile();
  const editor = useDesktopRoomTitlePlacementEditor();
  const [expanded, setExpanded] = useState(false);

  if (!debugEnabled || !editEnabled || !editor || !profile) return null;

  const statusLabel = editor.hasUnsavedChanges
    ? 'Unsaved'
    : editor.hasSavedOverrides
      ? 'Saved'
      : 'Defaults';

  const actionButtons = (
    <>
      <button type="button" style={panelButtonStyle} onClick={editor.saveOverrides}>
        Save
      </button>
      <button type="button" style={panelButtonStyle} onClick={editor.resetOverrides}>
        Reset
      </button>
      <button type="button" style={panelButtonStyle} onClick={() => void editor.copyOverridesJson()}>
        Copy JSON
      </button>
    </>
  );

  if (!expanded) {
    return (
      <div
        style={{
          ...shellStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: 6,
          padding: '6px 8px',
          maxWidth: 'calc(100vw - 16px)',
        }}
      >
        <span style={{ fontWeight: 700, whiteSpace: 'nowrap' }}>Room labels</span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 999,
            background:
              profile === 'desktop'
                ? 'rgba(235, 28, 36, 0.15)'
                : 'rgba(0, 188, 212, 0.18)',
            whiteSpace: 'nowrap',
          }}
        >
          {profile.toUpperCase()}
        </span>
        <span
          style={{
            padding: '2px 6px',
            borderRadius: 999,
            background: editor.hasUnsavedChanges ? '#ffe08a' : editor.hasSavedOverrides ? '#c8f7c5' : '#eee',
            whiteSpace: 'nowrap',
          }}
        >
          {statusLabel}
        </span>
        {editor.activeZoneId ? (
          <>
            <ScaleStepper
              label="Title"
              value={resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId), 'title')}
              onDecrease={() =>
                patchLineTextScale(
                  editor,
                  editor.activeZoneId!,
                  'title',
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'title') * 0.96,
                )
              }
              onIncrease={() =>
                patchLineTextScale(
                  editor,
                  editor.activeZoneId!,
                  'title',
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'title') * 1.04,
                )
              }
            />
            <ScaleStepper
              label="Subtitle"
              value={resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId), 'subtitle')}
              onDecrease={() =>
                patchLineTextScale(
                  editor,
                  editor.activeZoneId!,
                  'subtitle',
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'subtitle') * 0.96,
                )
              }
              onIncrease={() =>
                patchLineTextScale(
                  editor,
                  editor.activeZoneId!,
                  'subtitle',
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'subtitle') * 1.04,
                )
              }
            />
          </>
        ) : (
          <span style={{ opacity: 0.85, whiteSpace: 'nowrap' }}>Tap a label to edit size</span>
        )}
        {actionButtons}
        <button type="button" style={panelButtonStyle} onClick={() => setExpanded(true)}>
          Details ▾
        </button>
      </div>
    );
  }

  const zoneIds = Object.keys(DESKTOP_ROOM_TITLES);

  return (
    <div
      style={{
        ...shellStyle,
        width: 'min(380px, calc(100vw - 16px))',
        maxHeight: 'min(320px, calc(100vh - 16px))',
        display: 'flex',
        flexDirection: 'column',
        padding: '8px 10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
        <p style={{ margin: 0, fontWeight: 700, flex: 1 }}>Room label placement</p>
        <button type="button" style={{ ...panelButtonStyle, flexShrink: 0 }} onClick={() => setExpanded(false)}>
          Minimize ▴
        </button>
      </div>
      <p style={{ margin: '0 0 8px 0' }}>
        <strong>Red square = desktop</strong> (≥1024px). <strong>Cyan square = tablet</strong> (768–1023px). Tap a
        square, drag to reposition. Use the size steppers below (or <strong>wheel</strong> / <strong>pinch</strong> on a
        selected square) to scale text — wheel scales both lines; <strong>shift+wheel</strong> = title only;{' '}
        <strong>alt+wheel</strong> = subtitle only. Then <strong>Save</strong> to lock on this device.
      </p>
      <p style={{ margin: '0 0 8px 0', opacity: 0.9 }}>
        Enable with <code>?roomTitleDebug=1&amp;roomTitleEdit=1</code> on any <code>/desktop/*</code> room. Saved
        layouts persist in localStorage per profile.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>{actionButtons}</div>
      {editor.activeZoneId ? (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            marginBottom: 8,
            padding: '6px 8px',
            borderRadius: 4,
            border: '1px solid rgba(0,0,0,0.15)',
            background: 'rgba(0,0,0,0.03)',
          }}
        >
          <p style={{ margin: 0, fontWeight: 700 }}>Text size — {editor.activeZoneId}</p>
          <ScaleStepper
            label="Title"
            value={resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId), 'title')}
            onDecrease={() =>
              patchLineTextScale(
                editor,
                editor.activeZoneId!,
                'title',
                clampDesktopRoomTitleTextScale(
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'title') * 0.96,
                ),
              )
            }
            onIncrease={() =>
              patchLineTextScale(
                editor,
                editor.activeZoneId!,
                'title',
                clampDesktopRoomTitleTextScale(
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'title') * 1.04,
                ),
              )
            }
          />
          <ScaleStepper
            label="Subtitle"
            value={resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId), 'subtitle')}
            onDecrease={() =>
              patchLineTextScale(
                editor,
                editor.activeZoneId!,
                'subtitle',
                clampDesktopRoomTitleTextScale(
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'subtitle') * 0.96,
                ),
              )
            }
            onIncrease={() =>
              patchLineTextScale(
                editor,
                editor.activeZoneId!,
                'subtitle',
                clampDesktopRoomTitleTextScale(
                  resolveDesktopRoomTitleLineTextScale(editor.getPlacement(editor.activeZoneId!), 'subtitle') * 1.04,
                ),
              )
            }
          />
        </div>
      ) : null}
      <p style={{ margin: 0, opacity: 0.85 }}>
        Editing profile: <strong>{profile}</strong>
        {editor.activeZoneId ? ` — zone: ${editor.activeZoneId}` : ' — tap a label square to select'}
      </p>
      <ul style={{ margin: '6px 0 0 0', paddingLeft: 16, overflowY: 'auto', flex: 1, minHeight: 0 }}>
        {zoneIds.map((zoneId) => {
          const placement = editor.getPlacement(zoneId);
          const titleScale = resolveDesktopRoomTitleLineTextScale(placement, 'title');
          const subtitleScale = resolveDesktopRoomTitleLineTextScale(placement, 'subtitle');
          return (
            <li key={zoneId} style={{ marginBottom: 2 }}>
              {zoneId} — top:{placement.titleTopPct.toFixed(2)}% offset:{placement.centerOffsetPct.toFixed(2)}%
              gap:{placement.subtitleGapPx}px title:{titleScale.toFixed(2)}× subtitle:{subtitleScale.toFixed(2)}×
            </li>
          );
        })}
      </ul>
    </div>
  );
}
