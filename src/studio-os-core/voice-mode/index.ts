import { appendVoiceTranscript, patchVoiceModeProfile, setVoiceModeState } from './store';
import type {
  StudioSpeechRecognition,
  StudioSpeechRecognitionCtor,
  StudioSpeechRecognitionErrorEvent,
  StudioSpeechRecognitionEvent,
} from './speech-types';

function getSpeechRecognitionCtor(): StudioSpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as Window & {
    SpeechRecognition?: StudioSpeechRecognitionCtor;
    webkitSpeechRecognition?: StudioSpeechRecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

let activeRecognition: StudioSpeechRecognition | null = null;

export function stopVoiceListening(): void {
  if (activeRecognition) {
    try {
      activeRecognition.stop();
    } catch {
      /* ignore */
    }
    activeRecognition = null;
  }
}

export function startVoiceListening(
  organizationId: string,
  onFinal: (text: string) => void
): { ok: boolean; reason?: string } {
  stopVoiceListening();
  const Ctor = getSpeechRecognitionCtor();
  if (!Ctor) {
    patchVoiceModeProfile(organizationId, {
      state: 'unsupported',
      lastError: 'Speech recognition is not available in this browser.',
    });
    return { ok: false, reason: 'unsupported' };
  }

  const recognition = new Ctor();
  activeRecognition = recognition;
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  setVoiceModeState(organizationId, 'listening');

  recognition.onresult = (event: StudioSpeechRecognitionEvent) => {
    let interim = '';
    let finalText = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const result = event.results[i];
      const chunk = result[0]?.transcript ?? '';
      if (result.isFinal) finalText += chunk;
      else interim += chunk;
    }
    if (interim) appendVoiceTranscript(organizationId, interim.trim(), false);
    if (finalText.trim()) {
      appendVoiceTranscript(organizationId, finalText.trim(), true);
      setVoiceModeState(organizationId, 'processing');
      onFinal(finalText.trim());
      setVoiceModeState(organizationId, 'idle');
    }
  };

  recognition.onerror = (event: StudioSpeechRecognitionErrorEvent) => {
    const denied = event.error === 'not-allowed';
    patchVoiceModeProfile(organizationId, {
      state: denied ? 'permission-denied' : 'idle',
      lastError: event.message || event.error,
    });
    activeRecognition = null;
  };

  recognition.onend = () => {
    activeRecognition = null;
    const profile = patchVoiceModeProfile(organizationId, {});
    if (profile.state === 'listening') {
      setVoiceModeState(organizationId, 'idle');
    }
  };

  try {
    recognition.start();
    return { ok: true };
  } catch (err) {
    patchVoiceModeProfile(organizationId, {
      state: 'idle',
      lastError: err instanceof Error ? err.message : 'Could not start voice listening.',
    });
    return { ok: false, reason: 'start-failed' };
  }
}

export * from './constants';
export * from './types';
export * from './store';
