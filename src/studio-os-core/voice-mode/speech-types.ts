/** Minimal Web Speech API types — not included in all TypeScript DOM libs. */

export type StudioSpeechRecognitionResult = {
  isFinal: boolean;
  0: { transcript: string };
};

export type StudioSpeechRecognitionResultList = {
  length: number;
  [index: number]: StudioSpeechRecognitionResult;
  resultIndex?: number;
};

export type StudioSpeechRecognitionEvent = {
  resultIndex: number;
  results: StudioSpeechRecognitionResultList;
};

export type StudioSpeechRecognitionErrorEvent = {
  error: string;
  message?: string;
};

export interface StudioSpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onresult: ((event: StudioSpeechRecognitionEvent) => void) | null;
  onerror: ((event: StudioSpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
}

export type StudioSpeechRecognitionCtor = new () => StudioSpeechRecognition;
