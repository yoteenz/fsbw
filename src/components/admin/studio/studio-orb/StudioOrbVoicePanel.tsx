import { useCallback } from 'react';
import { useCommandDockState } from '../../../../hooks/useCommandDockState';
import { useConversationEngineState } from '../../../../hooks/useConversationEngineState';
import { useVoiceModeState } from '../../../../hooks/useConversationEngineState';
import { useOrganizationContextOptional } from '../../../../studio-os-core/organization-context';
import {
  conversationDockPanelStyle,
  orbLabel,
  orbPrimaryBtnStyle,
  orbProjectionInnerStyle,
  orbSecondaryBtnStyle,
  ORB_VISUAL,
} from './studioOrbTheme';
import { OrbIconVoice } from './OrbIconSculptures';
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
  const isListening = profile.state === 'listening';
  const isProcessing = profile.state === 'processing';

  return (
    <div
      className="studio-voice-mode-panel studio-conversation-dock-panel fixed left-1/2 z-[100055] pointer-events-auto"
      style={{
        ...conversationDockPanelStyle,
        transform: 'translateX(-50%)',
        bottom: 'max(72px, env(safe-area-inset-bottom, 0px) + 56px)',
        width: 'min(92vw, 420px)',
        padding: '16px 18px',
      }}
      role="dialog"
      aria-label="Voice Mode"
    >
      <div className="flex items-center justify-between mb-3">
        <p style={{ ...orbLabel, color: ORB_VISUAL.champagne, margin: 0 }}>VOICE MODE · STUDIO ORB</p>
        <button type="button" onClick={handleClose} style={{ ...orbSecondaryBtnStyle, padding: '6px 10px', fontSize: '6px' }}>
          CLOSE
        </button>
      </div>

      <p style={{ ...orbLabel, fontSize: '7px', color: ORB_VISUAL.textMuted, marginBottom: 12 }}>
        Speak naturally — Studio Intelligence™ routes your words through the Conversation Engine™.
      </p>

      {!profile.speechSupported ? (
        <p style={{ ...orbLabel, color: ORB_VISUAL.bronze }}>VOICE NOT SUPPORTED · USE COMMAND DOCK</p>
      ) : null}

      {profile.lastError ? (
        <p style={{ ...orbLabel, color: ORB_VISUAL.bronze, marginBottom: 8 }}>{profile.lastError.toUpperCase()}</p>
      ) : null}

      <div
        style={{
          ...orbProjectionInnerStyle,
          minHeight: 72,
          padding: 12,
          marginBottom: 12,
        }}
      >
        <p style={{ ...orbLabel, color: ORB_VISUAL.text, margin: 0 }}>
          {latest?.text?.toUpperCase() || 'TAP BELOW AND SPEAK TO THE ORB'}
        </p>
      </div>

      <div className="flex gap-2 justify-center items-center">
        <button
          type="button"
          onClick={isListening ? stopListening : handleListen}
          style={{
            ...orbPrimaryBtnStyle,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: isListening ? 'rgba(201, 169, 98, 0.28)' : orbPrimaryBtnStyle.background,
            boxShadow: isListening ? '0 0 24px rgba(201, 169, 98, 0.22)' : orbPrimaryBtnStyle.boxShadow,
          }}
        >
          <OrbIconVoice size={16} />
          {isListening ? 'LISTENING…' : isProcessing ? 'PROCESSING…' : 'ASK THE ORB'}
        </button>
        <button type="button" onClick={clear} style={{ ...orbSecondaryBtnStyle, padding: '10px 14px' }}>
          CLEAR
        </button>
      </div>
    </div>
  );
}
