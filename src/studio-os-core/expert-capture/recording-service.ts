export type RecordingCallbacks = {
  onMicLevel?: (level: number) => void;
  onDataAvailable?: (chunk: Blob) => void;
};

export type MediaCaptureHandle = {
  stream: MediaStream;
  videoElement: HTMLVideoElement | null;
  stop: () => void;
};

export async function requestMediaStream(): Promise<MediaStream> {
  return navigator.mediaDevices.getUserMedia({
    video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
    audio: true,
  });
}

export function attachMirroredPreview(stream: MediaStream, video: HTMLVideoElement): void {
  video.srcObject = stream;
  video.muted = true;
  video.playsInline = true;
  video.style.transform = 'scaleX(-1)';
  void video.play();
}

export function createMicLevelMonitor(
  stream: MediaStream,
  onLevel: (level: number) => void
): () => void {
  const ctx = new AudioContext();
  const source = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 256;
  source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);
  let raf = 0;
  const tick = () => {
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i += 1) sum += data[i];
    onLevel(Math.min(1, sum / data.length / 128));
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    void ctx.close();
  };
}

export class SessionRecorder {
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];

  start(stream: MediaStream, mimeType?: string): void {
    this.chunks = [];
    const type = mimeType ?? (MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus' : 'video/webm');
    this.recorder = new MediaRecorder(stream, { mimeType: type });
    this.recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) this.chunks.push(ev.data);
    };
    this.recorder.start(1000);
  }

  pause(): void {
    this.recorder?.pause();
  }

  resume(): void {
    this.recorder?.resume();
  }

  async stop(): Promise<{ videoBlob: Blob; audioBlob: Blob | null }> {
    const rec = this.recorder;
    if (!rec) return { videoBlob: new Blob(), audioBlob: null };
    await new Promise<void>((resolve) => {
      rec.onstop = () => resolve();
      rec.stop();
    });
    const videoBlob = new Blob(this.chunks, { type: rec.mimeType });
    return { videoBlob, audioBlob: videoBlob };
  }
}

export type SpeechTranscriber = {
  stop: () => void;
  getTranscript: () => string;
};

export function startSpeechTranscription(onPartial: (text: string) => void): SpeechTranscriber | null {
  type WebSpeechRecognition = {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    onresult: ((event: { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; 0?: { transcript?: string } } } }) => void) | null;
    start: () => void;
    stop: () => void;
  };
  const win = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  };
  const SR = win.SpeechRecognition ?? win.webkitSpeechRecognition;
  if (!SR) return null;

  let finalText = '';
  const recognition = new SR();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const r = event.results[i];
      if (r.isFinal) finalText += `${r[0]?.transcript ?? ''} `;
      else interim += r[0]?.transcript ?? '';
    }
    onPartial((finalText + interim).trim());
  };

  recognition.start();

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    },
    getTranscript: () => finalText.trim(),
  };
}

export async function speakText(text: string): Promise<void> {
  if (!('speechSynthesis' in window)) return;
  return new Promise((resolve) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.95;
    utter.onend = () => resolve();
    utter.onerror = () => resolve();
    window.speechSynthesis.speak(utter);
  });
}
