import { useCallback } from 'react';
import { useCommandDockState } from '../../../../hooks/useCommandDockState';
import { useConversationEngineState } from '../../../../hooks/useConversationEngineState';
import { useVoiceModeState } from '../../../../hooks/useConversationEngineState';
import { useOrganizationContextOptional } from '../../../../studio-os-core/organization-context';
import { conversationDockPanelStyle, orbLabel, ORB_VISUAL } from './studioOrbTheme';
import { useStudioOrb } from './StudioOrbProvider';

/** Voice Mode™ — Orb-native speech interface routed through Conversation Engine™. */
export function StudioOrbVoicePanel() {
  const orb = useStudioOrb();
  const open = orb.activeSurface === 'voice-mode';
  const org = useOrganizationContextOptional();
  const organizationId = org?.organizationId ?? 'frontal-slayer';
  const { profile, startListening, stopListening, clear, refresh } = useVoiceModeState(organizationId);
  const { openSession, recordTurn, closeSession } = useConversationEngineState(organizationId);
  const dock = useCommandDockState();

  const handleClose = useCallback(() => {
    stopListening();
    closeSession();
    orb.closeSurface();
  }, [closeSession, orb, stopListening]);

  const submitTranscript = useCallback(
    (text: string) => {
      openSession('voice-mode');
      recordTurn({ role: 'user', text, surface: 'voice-mode' });
      dock.setInput(text);
      dock.submit();
      recordTurn({
        role: 'assistant',
        text: 'Routed to Studio Intelligence™.',
        surface: 'voice-mode',
      });
      refresh();
    },
    [dock, openSession, recordTurn, refresh]
  );

  const handleListen = useCallback(() => {
    openSession('voice-mode');
    startListening(submitTranscript);
  }, [openSession, startListening, submitTranscript]);

  if (!open) return null;

  const latest = profile.transcripts[profile.transcripts.length - 1];

  return (
    <div
      className="studio-voice-mode-panel fixed left-1/2 z-[100055] pointer-events-auto"
      style={{
        ...conversationDockPanelStyle,
        transform: 'translateX(-50%)',
        bottom: 'max(72px, env(safe-area-inset-bottom, 0px) + 56px)',
        width: 'min(92vw, 420px)',
      }}
      role="dialog"
      aria-label="Voice Mode"
    >
      <div className="flex items-center justify-between mb-3">
        <p style={{ ...orbLabel, color: ORB_VISUAL.text, margin: 0 }}>VOICE MODE · STUDIO ORB</p>
        <button type="button" onClick={handleClose} style={{ ...orbLabel, background: 'none', border: 'none', cursor: 'pointer' }}>
          CLOSE
        </button>
      </div>

      <p style={{ ...orbLabel, fontSize: '7px', color: ORB_VISUAL.textMuted, marginBottom: 12 }}>
        Speak naturally — Studio Intelligence™ routes your words through the Conversation Engine™.
      </p>

      {!profile.speechSupported ? (
        <p style={{ ...orbLabel, color: '#EB1C24' }}>VOICE NOT SUPPORTED IN THIS BROWSER · USE COMMAND DOCK</p>
      ) : null}

      {profile.lastError ? (
        <p style={{ ...orbLabel, color: '#EB1C24', marginBottom: 8 }}>{profile.lastError.toUpperCase()}</p>
      ) : null}

      <div
        style={{
          minHeight: 72,
          padding: 12,
          borderRadius: 12,
          background: 'rgba(255,255,255,0.55)',
          border: '1px solid rgba(255,255,255,0.8)',
          marginBottom: 12,
        }}
      >
        <p style={{ ...orbLabel, color: ORB_VISUAL.text, margin: 0 }}>
          {latest?.text?.toUpperCase() || 'TAP THE ORB BELOW AND SPEAK'}
        </p>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          type="button"
          onClick={profile.state === 'listening' ? stopListening : handleListen}
          style={{
            ...orbLabel,
            padding: '10px 18px',
            borderRadius: 999,
            border: '1px solid rgba(0,0,0,0.12)',
            background: profile.state === 'listening' ? 'rgba(235,28,36,0.12)' : 'rgba(255,255,255,0.9)',
            cursor: 'pointer',
          }}
        >
          {profile.state === 'listening' ? 'LISTENING…' : profile.state === 'processing' ? 'PROCESSING…' : '🎙 ASK THE ORB'}
        </button>
        <button
          type="button"
          onClick={clear}
          style={{ ...orbLabel, padding: '10px 14px', borderRadius: 999, border: '1px solid rgba(0,0,0,0.08)', background: 'transparent', cursor: 'pointer' }}
        >
          CLEAR
        </button>
      </div>
    </div>
  );
}
