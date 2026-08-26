import { useState } from 'react';
import { CharacterLabTabContent } from './CharacterLabTabContent';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

/** Voice Lab data contract — structured placeholders until canon specifies fields. */
export type VoiceLabState = 'idle' | 'loading' | 'empty' | 'error' | 'ready';

export type VoiceLabProfile = {
  voicePreset: string;
  tone: string;
  pace: string;
  language: string;
};

const DEFAULT_PROFILE: VoiceLabProfile = {
  voicePreset: 'CONTENT_REQUIRED',
  tone: 'CONTENT_REQUIRED',
  pace: 'CONTENT_REQUIRED',
  language: 'EN-US',
};

type Props = {
  initialState?: VoiceLabState;
};

export function VoiceLabContent({ initialState = 'ready' }: Props) {
  const [state, setState] = useState<VoiceLabState>(initialState);
  const [profile, setProfile] = useState<VoiceLabProfile>(DEFAULT_PROFILE);

  return (
    <CharacterLabTabContent
      title="VOICE LAB"
      description="VOICE PRESET · TONE · PACE · LANGUAGE · CHARACTER VOICE BINDING"
      loading={state === 'loading'}
      error={state === 'error' ? 'VOICE PROFILE UNAVAILABLE' : null}
      emptyState={state === 'empty' ? 'NO VOICE PROFILE SELECTED · BIND A CHARACTER VOICE' : undefined}
    >
      {state === 'ready' ? (
        <div className="flex flex-col gap-3" data-voice-lab-controls="true">
          <label className="flex flex-col gap-1">
            <span className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              VOICE PRESET
            </span>
            <input
              className="border px-2 py-1 text-[8px] font-futura uppercase"
              style={{ borderColor: ADMIN_STUDIO_THEME.inputBorder, background: ADMIN_STUDIO_THEME.inputBg }}
              value={profile.voicePreset}
              onChange={(e) => setProfile((p) => ({ ...p, voicePreset: e.target.value }))}
              data-control="voice-preset"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              TONE
            </span>
            <input
              className="border px-2 py-1 text-[8px] font-futura uppercase"
              style={{ borderColor: ADMIN_STUDIO_THEME.inputBorder, background: ADMIN_STUDIO_THEME.inputBg }}
              value={profile.tone}
              onChange={(e) => setProfile((p) => ({ ...p, tone: e.target.value }))}
              data-control="tone"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[7px] font-futura uppercase" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
              PACE
            </span>
            <input
              className="border px-2 py-1 text-[8px] font-futura uppercase"
              style={{ borderColor: ADMIN_STUDIO_THEME.inputBorder, background: ADMIN_STUDIO_THEME.inputBg }}
              value={profile.pace}
              onChange={(e) => setProfile((p) => ({ ...p, pace: e.target.value }))}
              data-control="pace"
            />
          </label>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              className="px-2 py-1 text-[7px] font-futura uppercase border"
              style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, color: ADMIN_STUDIO_THEME.textPrimary }}
              onClick={() => setState('loading')}
              data-action="test-voice"
            >
              TEST VOICE
            </button>
            <button
              type="button"
              className="px-2 py-1 text-[7px] font-futura uppercase"
              style={{ background: ADMIN_STUDIO_THEME.accent, color: ADMIN_STUDIO_THEME.textOnAccent }}
              onClick={() => setState('ready')}
              data-action="save-voice"
            >
              SAVE VOICE PROFILE
            </button>
          </div>
        </div>
      ) : null}
    </CharacterLabTabContent>
  );
}
