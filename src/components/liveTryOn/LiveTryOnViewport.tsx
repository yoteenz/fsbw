import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  LIVE_TRY_ON_FACE_LANDMARKER_MODEL,
  LIVE_TRY_ON_MEDIAPIPE_WASM_BASE,
  type LiveTryOnWigView,
} from '../../constants/liveTryOnSpikeAssets';
import { drawWigOverlayWithFaceHole } from '../../utils/liveTryOnComposite';
import {
  estimateHeadYawNorm,
  pickWigViewFromYaw,
  wigPlacementFromLandmarks,
  type NormPoint,
} from '../../utils/liveTryOnYaw';

type Status = 'loading' | 'permission' | 'live' | 'no-face' | 'error';

type Props = {
  /** [left, front, right] public URLs (transparent PNG preferred). */
  wigUrls: [string, string, string] | null;
};

function loadWigImages(urls: [string, string, string]): Promise<Record<LiveTryOnWigView, HTMLImageElement>> {
  const views: LiveTryOnWigView[] = ['left', 'front', 'right'];
  const keys: LiveTryOnWigView[] = ['left', 'front', 'right'];
  return Promise.all(
    views.map(
      (view, i) =>
        new Promise<{ view: LiveTryOnWigView; img: HTMLImageElement }>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve({ view: keys[i], img });
          img.onerror = () => reject(new Error(`Failed to load ${view}`));
          img.src = urls[i];
        })
    )
  ).then((pairs) => {
    const out = {} as Record<LiveTryOnWigView, HTMLImageElement>;
    pairs.forEach(({ view, img }) => {
      out[view] = img;
    });
    return out;
  });
}

export default function LiveTryOnViewport({ wigUrls }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef(-1);
  const noFaceFramesRef = useRef(0);
  const wigImagesRef = useRef<Record<LiveTryOnWigView, HTMLImageElement> | null>(null);
  const overlayScratchRef = useRef<HTMLCanvasElement | null>(null);

  const [status, setStatus] = useState<Status>('loading');
  const [statusHint, setStatusHint] = useState('LOADING CAMERA…');
  const [debugYaw, setDebugYaw] = useState(0);
  const [activeView, setActiveView] = useState<LiveTryOnWigView>('front');
  const [assetsReady, setAssetsReady] = useState(false);

  useEffect(() => {
    if (!wigUrls) {
      setAssetsReady(false);
      wigImagesRef.current = null;
      return;
    }
    let cancelled = false;
    setAssetsReady(false);
    loadWigImages(wigUrls)
      .then((imgs) => {
        if (cancelled) return;
        wigImagesRef.current = imgs;
        setAssetsReady(true);
      })
      .catch(() => {
        if (!cancelled) setAssetsReady(false);
      });
    return () => {
      cancelled = true;
    };
  }, [wigUrls?.[0], wigUrls?.[1], wigUrls?.[2]]);

  const drawFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker || video.readyState < 2) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    const wigImages = wigImagesRef.current;
    if (!assetsReady || !wigImages) return;

    const now = performance.now();
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const result = landmarker.detectForVideo(video, now);
        const landmarks = result.faceLandmarks?.[0] as NormPoint[] | undefined;
        if (landmarks?.length) {
          noFaceFramesRef.current = 0;
          const yaw = estimateHeadYawNorm(landmarks);
          const view = pickWigViewFromYaw(yaw);
          setActiveView(view);
          setDebugYaw(yaw);
          setStatus('live');
          setStatusHint('LIVE PREVIEW — TURN SLOWLY TO SEE ANGLES');

          const placement = wigPlacementFromLandmarks(landmarks, w, h);
          const wigImg = wigImages[view];
          if (placement && wigImg?.complete && wigImg.naturalWidth > 0) {
            if (!overlayScratchRef.current) {
              overlayScratchRef.current = document.createElement('canvas');
            }
            drawWigOverlayWithFaceHole(
              ctx,
              w,
              h,
              wigImg,
              placement,
              landmarks,
              overlayScratchRef.current
            );
          }
        } else {
          noFaceFramesRef.current += 1;
          if (noFaceFramesRef.current > 8) {
            setStatus('no-face');
            setStatusHint('CENTER YOUR FACE IN THE FRAME');
          }
        }
      } catch {
        /* skip frame */
      }
    }
  }, [assetsReady]);

  const loop = useCallback(() => {
    drawFrame();
    rafRef.current = requestAnimationFrame(loop);
  }, [drawFrame]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(LIVE_TRY_ON_MEDIAPIPE_WASM_BASE);
        if (cancelled) return;
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: LIVE_TRY_ON_FACE_LANDMARKER_MODEL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
        });
        if (cancelled) return;
        landmarkerRef.current = landmarker;

        setStatus('permission');
        setStatusHint('ALLOW CAMERA TO CONTINUE');
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();

        const canvas = canvasRef.current;
        if (canvas) {
          canvas.width = video.videoWidth || 720;
          canvas.height = video.videoHeight || 1280;
        }

        setStatus('no-face');
        setStatusHint('CENTER YOUR FACE IN THE FRAME');
        rafRef.current = requestAnimationFrame(loop);
      } catch (e) {
        const msg = e instanceof Error ? e.message : 'CAMERA UNAVAILABLE';
        setStatus('error');
        setStatusHint(msg.toUpperCase());
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current);
      stream?.getTracks().forEach((t) => t.stop());
      landmarkerRef.current?.close();
      landmarkerRef.current = null;
    };
  }, [loop]);

  return (
    <div className="relative w-full overflow-hidden bg-black" style={{ aspectRatio: '9 / 16', maxHeight: 'min(78dvh, 640px)' }}>
      <video ref={videoRef} playsInline muted className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />

      <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
        <div
          style={{
            width: '72%',
            height: '58%',
            border: '2px solid rgba(235, 28, 36, 0.85)',
            borderRadius: '50%',
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.35)',
          }}
        />
      </div>

      <div
        className="pointer-events-none absolute left-0 right-0 px-3 text-center"
        style={{ top: '10px', fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#FFFFFF', textTransform: 'uppercase' }}
      >
        {statusHint}
      </div>

      {!assetsReady && wigUrls ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#FFFFFF' }}>LOADING YOUR WIG…</p>
        </div>
      ) : null}

      {import.meta.env.DEV ? (
        <div
          className="pointer-events-none absolute bottom-2 left-2 px-2 py-1 rounded"
          style={{ fontFamily: 'monospace', fontSize: '9px', color: '#63ff63', background: 'rgba(0,0,0,0.5)' }}
        >
          yaw {debugYaw.toFixed(2)} · {activeView}
        </div>
      ) : null}

      {status === 'loading' || status === 'permission' ? (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF' }}>{statusHint}</p>
        </div>
      ) : null}
    </div>
  );
}
