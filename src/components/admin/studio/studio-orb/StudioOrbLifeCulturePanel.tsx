import { useState, type CSSProperties } from 'react';
import { useOrganizationContextOptional } from '../../../../studio-os-core/organization-context';
import { getRuntimeActiveWorkspaceId } from '../../../../studio-os-core/workspace/storage';
import {
  useLifeCulturePreferencesState,
  COMMUNICATION_STYLE_LABELS,
  EVENT_RESPONSE_LABELS,
  HOLIDAY_CATALOG,
  LAYER_LABELS,
  LIFE_CULTURE_INTRO_FOOTER,
  PRIVACY_NOTICE,
  SENSITIVE_EVENT_CATALOG,
  SENSITIVE_EVENT_RESPONSE_LABELS,
  type CommunicationStyle,
  type EventResponse,
  type PreferenceLayer,
  type SensitiveEventResponse,
} from '../../../../hooks/useLifeCulturePreferencesState';
import { useStudioOrb } from './StudioOrbProvider';
import { conversationDockPanelStyle, orbBody, orbGrace, orbLabel, ORB_VISUAL } from './studioOrbTheme';

const LAYERS: PreferenceLayer[] = ['personal', 'household', 'organization', 'department', 'workspace'];
const COMM_STYLES = Object.keys(COMMUNICATION_STYLE_LABELS) as CommunicationStyle[];
const EVENT_RESPONSES = Object.keys(EVENT_RESPONSE_LABELS) as EventResponse[];
const SENSITIVE_RESPONSES = Object.keys(SENSITIVE_EVENT_RESPONSE_LABELS) as SensitiveEventResponse[];

/** Life & Culture Preferences™ — conversational personalization inside Studio Orb™. */
export function StudioOrbLifeCulturePanel() {
  const orb = useStudioOrb();
  const org = useOrganizationContextOptional();
  const organizationId = org?.organizationId ?? getRuntimeActiveWorkspaceId();
  const open = orb.activeSurface === 'life-culture';

  const { store, patchLayer, setHoliday, setSensitive, completeIntro, exportPreferences, deletePreferences } =
    useLifeCulturePreferencesState(organizationId);

  const [activeLayer, setActiveLayer] = useState<PreferenceLayer>('personal');
  const layer = store.layers[activeLayer];

  if (!open) return null;

  return (
    <div
      className="fixed left-1/2 z-[100055] pointer-events-auto"
      style={{
        top: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'min(640px, calc(100vw - 24px))',
        maxHeight: 'min(520px, 78vh)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Life and Culture Preferences"
    >
      <div
        className="overflow-hidden rounded-md flex flex-col"
        style={{
          ...conversationDockPanelStyle,
          maxHeight: 'min(520px, 78vh)',
        }}
      >
        <div className="px-4 py-3 border-b flex items-start justify-between gap-2" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
          <div>
            <p style={{ ...orbLabel, color: ORB_VISUAL.brandRed, margin: 0 }}>STUDIO ORB · LIFE & CULTURE</p>
            <p style={{ ...orbGrace, fontSize: '16px', margin: '6px 0 0' }}>Help Studio Intelligence understand what matters to you</p>
            <p style={{ ...orbBody, fontSize: '7px', color: ORB_VISUAL.textMuted, marginTop: 6 }}>
              Emotional Intelligence™ · optional · never assumed
            </p>
          </div>
          <button type="button" onClick={() => orb.closeSurface()} style={orbCloseBtn}>
            CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
          {!store.introCompleted ? (
            <section style={sectionStyle}>
              <p style={{ ...orbBody, fontSize: '8px', lineHeight: 1.55 }}>
                Studio Intelligence™ learns through respectful conversation — not assumptions. Share only what you
                are comfortable with. Every field is optional.
              </p>
              <button type="button" style={primaryBtn} onClick={completeIntro}>
                BEGIN PERSONALIZATION
              </button>
            </section>
          ) : null}

          <section style={sectionStyle}>
            <p style={sectionLabel}>PREFERENCE LAYER</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {LAYERS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setActiveLayer(l)}
                  style={{
                    ...chipBtn,
                    borderColor: activeLayer === l ? ORB_VISUAL.brandRed : 'rgba(0,0,0,0.1)',
                    color: activeLayer === l ? ORB_VISUAL.brandRed : ORB_VISUAL.text,
                  }}
                >
                  {LAYER_LABELS[l]}
                </button>
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <p style={sectionLabel}>COMMUNICATION STYLE</p>
            <div className="flex flex-wrap gap-1 mt-2">
              {COMM_STYLES.map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => patchLayer(activeLayer, { communicationStyle: style })}
                  style={{
                    ...chipBtn,
                    borderColor: layer.communicationStyle === style ? ORB_VISUAL.brandRed : 'rgba(0,0,0,0.1)',
                  }}
                >
                  {COMMUNICATION_STYLE_LABELS[style]}
                </button>
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <p style={sectionLabel}>SEASONAL & HEADQUARTERS ATMOSPHERE</p>
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={layer.seasonalCelebrationsEnabled}
                onChange={(e) => patchLayer(activeLayer, { seasonalCelebrationsEnabled: e.target.checked })}
              />
              <span style={{ ...orbBody, fontSize: '8px' }}>
                Allow tasteful seasonal storytelling in Headquarters for this layer
              </span>
            </label>
          </section>

          <section style={sectionStyle}>
            <p style={sectionLabel}>HOLIDAYS & OBSERVANCES</p>
            <div className="space-y-2 mt-3 max-h-40 overflow-y-auto">
              {HOLIDAY_CATALOG.filter((h) => h.month >= 0).slice(0, 8).map((holiday) => (
                <div key={holiday.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span style={{ ...orbBody, fontSize: '8px' }}>{holiday.label}</span>
                  <select
                    value={layer.holidayResponses[holiday.id] ?? 'unset'}
                    onChange={(e) => setHoliday(activeLayer, holiday.id, e.target.value as EventResponse)}
                    style={selectStyle}
                  >
                    {EVENT_RESPONSES.map((r) => (
                      <option key={r} value={r}>
                        {EVENT_RESPONSE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <p style={sectionLabel}>SENSITIVE LIFE EVENTS</p>
            <div className="space-y-2 mt-3 max-h-36 overflow-y-auto">
              {SENSITIVE_EVENT_CATALOG.map((event) => (
                <div key={event.id} className="flex flex-wrap items-center justify-between gap-2">
                  <span style={{ ...orbBody, fontSize: '8px' }}>{event.label}</span>
                  <select
                    value={layer.sensitiveEventResponses[event.id] ?? 'unset'}
                    onChange={(e) => setSensitive(activeLayer, event.id, e.target.value as SensitiveEventResponse)}
                    style={selectStyle}
                  >
                    {SENSITIVE_RESPONSES.map((r) => (
                      <option key={r} value={r}>
                        {SENSITIVE_EVENT_RESPONSE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </section>

          <section style={sectionStyle}>
            <p style={sectionLabel}>PRIVACY & CONTROL</p>
            <ul style={{ ...orbBody, fontSize: '7px', lineHeight: 1.6, margin: '8px 0', paddingLeft: 14 }}>
              <li>{PRIVACY_NOTICE.why}</li>
              <li>{PRIVACY_NOTICE.usage}</li>
              <li>{PRIVACY_NOTICE.storage}</li>
              <li>{PRIVACY_NOTICE.access}</li>
            </ul>
            <div className="flex flex-wrap gap-2 mt-2">
              <button
                type="button"
                style={secondaryBtn}
                onClick={() => {
                  const blob = new Blob([exportPreferences()], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'life-culture-preferences.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                EXPORT
              </button>
              <button
                type="button"
                style={{ ...secondaryBtn, color: ORB_VISUAL.brandRed, borderColor: 'rgba(235,28,36,0.35)' }}
                onClick={() => {
                  if (window.confirm('Permanently delete all Life & Culture Preferences for this organization?')) {
                    deletePreferences();
                  }
                }}
              >
                DELETE ALL
              </button>
            </div>
          </section>

          <p style={{ ...orbBody, fontSize: '8px', lineHeight: 1.6, color: ORB_VISUAL.textMuted, fontStyle: 'italic' }}>
            {LIFE_CULTURE_INTRO_FOOTER}
          </p>
        </div>
      </div>
    </div>
  );
}

const sectionStyle: CSSProperties = {
  padding: '12px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.55)',
  border: '1px solid rgba(255,255,255,0.85)',
};

const sectionLabel: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '7px',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: '#808080',
  margin: 0,
};

const chipBtn: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  padding: '6px 8px',
  border: '1px solid rgba(0,0,0,0.1)',
  background: 'rgba(255,255,255,0.85)',
  borderRadius: 6,
  cursor: 'pointer',
};

const selectStyle: CSSProperties = {
  fontFamily: '"Futura PT Book"',
  fontSize: '7px',
  padding: '4px 6px',
  borderRadius: 6,
  border: '1px solid rgba(0,0,0,0.12)',
  background: 'white',
  maxWidth: 160,
};

const primaryBtn: CSSProperties = {
  marginTop: 12,
  fontFamily: '"Futura PT Medium"',
  fontSize: '7px',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  padding: '8px 12px',
  border: '1px solid rgba(235,28,36,0.35)',
  color: ORB_VISUAL.brandRed,
  background: 'rgba(255,255,255,0.9)',
  borderRadius: 6,
  cursor: 'pointer',
};

const secondaryBtn: CSSProperties = {
  ...primaryBtn,
  marginTop: 0,
  color: ORB_VISUAL.text,
  borderColor: 'rgba(0,0,0,0.12)',
};

const orbCloseBtn: CSSProperties = {
  fontFamily: '"Futura PT Medium"',
  fontSize: '6px',
  letterSpacing: '0.08em',
  border: '1px solid rgba(0,0,0,0.12)',
  background: 'rgba(255,255,255,0.9)',
  padding: '6px 8px',
  cursor: 'pointer',
  borderRadius: 4,
};
