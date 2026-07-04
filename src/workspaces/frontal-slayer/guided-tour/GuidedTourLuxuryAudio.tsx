import { useEffect, useRef } from 'react';

type Props = { enabled: boolean; recordMode: boolean };

/** Optional immersive ambient pad — muted by default · Web Audio gentle noise + tone. */
export function GuidedTourLuxuryAudio({ enabled, recordMode }: Props) {
  const ctxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<OscillatorNode[]>([]);

  useEffect(() => {
    if (!enabled) {
      nodesRef.current.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* ignore */
        }
      });
      nodesRef.current = [];
      void ctxRef.current?.close();
      ctxRef.current = null;
      return;
    }

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    ctxRef.current = ctx;

    const gain = ctx.createGain();
    gain.gain.value = recordMode ? 0.06 : 0.04;
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 110;
    const oscGain = ctx.createGain();
    oscGain.gain.value = 0.15;
    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    nodesRef.current.push(osc);

    const bufferSize = 2 * ctx.sampleRate;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.02;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    noise.loop = true;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 400;
    noise.connect(filter);
    filter.connect(gain);
    noise.start();

    return () => {
      nodesRef.current.forEach((n) => {
        try {
          n.stop();
        } catch {
          /* ignore */
        }
      });
      nodesRef.current = [];
      void ctx.close();
    };
  }, [enabled, recordMode]);

  return null;
}
