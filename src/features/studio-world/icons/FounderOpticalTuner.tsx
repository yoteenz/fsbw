import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react';
import type { ExperienceLabIconName } from './experience-lab-icon-registry';
import { EXPERIENCE_LAB_ICON_NAMES } from './experience-lab-icon-registry';
import { ExperienceLabIconPresentation } from './ExperienceLabIconPresentation';
import {
  clearFounderPresentationOverride,
  exportFounderPresentationPatchFragment,
  getFounderPresentationOverrides,
  isFounderOpticalModeEnabled,
  presentExperienceLabIcon,
  resolveCanonicalIconPresentation,
  resolveIconPresentation,
  setFounderOpticalModeEnabled,
  setFounderPresentationOverride,
  type FounderPresentationPatch,
} from './experience-lab-icon-presenter';
import { STUDIO_WORLD_ICON_PRESENTATION_VERSION } from './experience-lab-icon-presentation';

type Props = {
  selected: ExperienceLabIconName | null;
  onSelect: (name: ExperienceLabIconName | null) => void;
};

const SLIDER_FIELDS: Array<{
  key: keyof FounderPresentationPatch;
  label: string;
  min: number;
  max: number;
  step: number;
}> = [
  { key: 'scale', label: 'Scale', min: 0.85, max: 1.45, step: 0.01 },
  { key: 'offsetX', label: 'Offset X', min: -6, max: 6, step: 1 },
  { key: 'offsetY', label: 'Offset Y', min: -6, max: 6, step: 1 },
  { key: 'padding', label: 'Padding', min: 0, max: 6, step: 1 },
  { key: 'opticalWeight', label: 'Optical weight', min: 0.85, max: 1.2, step: 0.01 },
  { key: 'baselineAdjust', label: 'Baseline', min: -4, max: 4, step: 1 },
];

/** Founder Optical Mode — live per-icon presentation tuner (dev/admin). */
export function FounderOpticalTuner({ selected }: Props) {
  const [enabled, setEnabled] = useState(isFounderOpticalModeEnabled());
  const [compareMode, setCompareMode] = useState(false);
  const [compareOpacity, setCompareOpacity] = useState(0.45);
  const [revision, setRevision] = useState(0);
  const [exportText, setExportText] = useState('');

  const refresh = useCallback(() => setRevision((n) => n + 1), []);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-world:icon-presentation-updated', onUpdate);
    window.addEventListener('studio-world:founder-optical-mode', onUpdate);
    return () => {
      window.removeEventListener('studio-world:icon-presentation-updated', onUpdate);
      window.removeEventListener('studio-world:founder-optical-mode', onUpdate);
    };
  }, [refresh]);

  const profile = selected ? resolveIconPresentation(selected) : null;
  const canonical = selected ? resolveCanonicalIconPresentation(selected) : null;
  const overrides = useMemo(() => getFounderPresentationOverrides(), [revision]);

  const toggleMode = () => {
    const next = !enabled;
    setEnabled(next);
    setFounderOpticalModeEnabled(next);
  };

  const updateField = (key: keyof FounderPresentationPatch, value: number) => {
    if (!selected) return;
    setFounderPresentationOverride(selected, { [key]: value });
    refresh();
  };

  const resetIcon = () => {
    if (!selected) return;
    clearFounderPresentationOverride(selected);
    refresh();
  };

  const handleExport = () => {
    const fragment = exportFounderPresentationPatchFragment();
    setExportText(fragment);
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(fragment);
    }
  };

  const presented = selected ? presentExperienceLabIcon(selected, 'lg') : null;

  return (
    <section
      style={{
        marginBottom: 24,
        padding: 16,
        border: '1px solid rgba(201,169,98,0.25)',
        borderRadius: 10,
        background: 'rgba(201,169,98,0.04)',
      }}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <h2 style={{ fontSize: 13, margin: 0, flex: 1 }}>Founder Optical Mode</h2>
        <button
          type="button"
          onClick={toggleMode}
          style={{
            fontSize: 10,
            padding: '6px 12px',
            borderRadius: 6,
            border: '1px solid rgba(255,255,255,0.2)',
            background: enabled ? 'rgba(201,169,98,0.25)' : 'rgba(255,255,255,0.06)',
            color: '#f0ebe3',
            cursor: 'pointer',
          }}
        >
          {enabled ? 'ON — guides visible' : 'OFF'}
        </button>
        <label style={{ fontSize: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input
            type="checkbox"
            checked={compareMode}
            onChange={(e) => setCompareMode(e.target.checked)}
          />
          Compare canonical overlay
        </label>
      </div>

      <p style={{ fontSize: 11, color: '#9a958c', marginTop: 0 }}>
        Presentation {STUDIO_WORLD_ICON_PRESENTATION_VERSION} · tap any icon below to tune · adjustments persist in
        localStorage until exported to registry
      </p>

      {selected && profile && canonical && presented ? (
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 16, alignItems: 'start' }}>
          <div
            style={{
              display: 'grid',
              placeItems: 'center',
              minHeight: 120,
              background: '#111',
              borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.1)',
              padding: 16,
            }}
          >
            <ExperienceLabIconPresentation
              name={selected}
              size="lg"
              alt=""
              decorative
              showGuides={enabled}
              compareCanonical={compareMode}
              compareOpacity={compareOpacity}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 8 }}>{selected}</div>
            {SLIDER_FIELDS.map((field) => (
              <label key={String(field.key)} style={{ display: 'block', fontSize: 10, marginBottom: 8 }}>
                {field.label}: {Number(profile[field.key] ?? 0).toFixed(2)}
                <input
                  type="range"
                  min={field.min}
                  max={field.max}
                  step={field.step}
                  value={Number(profile[field.key] ?? 0)}
                  onChange={(e) => updateField(field.key, Number(e.target.value))}
                  style={{ width: '100%', display: 'block', marginTop: 4 }}
                />
              </label>
            ))}
            {compareMode ? (
              <label style={{ display: 'block', fontSize: 10, marginBottom: 8 }}>
                Overlay opacity: {compareOpacity.toFixed(2)}
                <input
                  type="range"
                  min={0.1}
                  max={0.9}
                  step={0.05}
                  value={compareOpacity}
                  onChange={(e) => setCompareOpacity(Number(e.target.value))}
                  style={{ width: '100%', display: 'block', marginTop: 4 }}
                />
              </label>
            ) : null}
            <div style={{ fontSize: 9, color: '#6a958c', marginBottom: 8 }}>
              Scores — overall {profile.scores.overall}% · center {profile.scores.centering}% · scale{' '}
              {profile.scores.scale}% · weight {profile.scores.visualWeight}%
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" onClick={resetIcon} style={btnStyle}>
                Reset icon
              </button>
              <button type="button" onClick={handleExport} style={btnStyle}>
                Copy export fragment
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: 11, color: '#9a958c' }}>
          Enable Founder Optical Mode and select an icon to nudge scale/offset live.
        </p>
      )}

      {Object.keys(overrides).length > 0 ? (
        <p style={{ fontSize: 9, color: '#c9a962', marginTop: 12 }}>
          {Object.keys(overrides).length} founder override(s) in localStorage — export to merge into presentation
          registry
        </p>
      ) : null}

      {exportText ? (
        <pre
          style={{
            marginTop: 12,
            fontSize: 9,
            maxHeight: 160,
            overflow: 'auto',
            background: 'rgba(0,0,0,0.35)',
            padding: 10,
            borderRadius: 6,
          }}
        >
          {exportText}
        </pre>
      ) : null}
    </section>
  );
}

const btnStyle: CSSProperties = {
  fontSize: 10,
  padding: '6px 10px',
  borderRadius: 6,
  border: '1px solid rgba(255,255,255,0.14)',
  background: 'rgba(255,255,255,0.06)',
  color: '#f0ebe3',
  cursor: 'pointer',
};

export function useFounderOpticalSelection() {
  const [selected, setSelected] = useState<ExperienceLabIconName | null>(null);
  return { selected, setSelected, names: EXPERIENCE_LAB_ICON_NAMES };
}
