import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  LIVE_TRY_ON_FACE_LANDMARKER_MODEL,
  LIVE_TRY_ON_MEDIAPIPE_WASM_BASE,
} from '../../constants/liveTryOnSpikeAssets';
import { getAccessToken, postLiveTryOnStudioRenderAndWait } from '../../utils/api';
import { captureMirroredVideoJpeg } from '../../utils/liveTryOnCapture';
import { estimateHeadYawNorm, pickWigViewFromYaw } from '../../utils/liveTryOnYaw';

type Status = 'loading' | 'permission' | 'ready' | 'no-face' | 'rendering' | 'result' | 'error';

type Props = {
  color: string;
  unitKey: string;
};

function syncCanvasToVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): void {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw > 0 && vh > 0 && (canvas.width !== vw || canvas.height !== vh)) {
    canvas.width = vw;
    canvas.height = vh;
  }
}

export default function LiveTryOnStudioCapture({ color, unitKey }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const landmarkerRef = useRef<FaceLandmarker | null>(null);
  const rafRef = useRef<number>(0);
  const lastVideoTimeRef = useRef(-1);
  const noFaceFramesRef = useRef(0);
  const showingResultRef = useRef(false);

  const [status, setStatus] = useState<Status>('loading');
  const [statusHint, setStatusHint] = useState('LOADING CAMERA…');
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAngle, setActiveAngle] = useState<'left' | 'front' | 'right'>('front');

  const drawPreview = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const landmarker = landmarkerRef.current;
    if (!video || !canvas || !landmarker || video.readyState < 2) return;

    syncCanvasToVideo(video, canvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    if (w < 2 || h < 2) return;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    if (showingResultRef.current) return;

    const now = performance.now();
    if (video.currentTime !== lastVideoTimeRef.current) {
      lastVideoTimeRef.current = video.currentTime;
      try {
        const result = landmarker.detectForVideo(video, now);
        const landmarks = result.faceLandmarks?.[0];
        if (landmarks?.length) {
          noFaceFramesRef.current = 0;
          const yaw = estimateHeadYawNorm(landmarks);
          setActiveAngle(pickWigViewFromYaw(yaw));
          setStatus((s) => (s === 'rendering' ? s : 'ready'));
          setStatusHint('CENTER YOUR FACE — TAP CAPTURE WHEN READY');
        } else {
          noFaceFramesRef.current += 1;
          if (noFaceFramesRef.current > 8) {
            setStatus((s) => (s === 'rendering' ? s : 'no-face'));
            setStatusHint('LOOK AT THE CAMERA TO CAPTURE');
          }
        }
      } catch {
        /* skip frame */
      }
    }
  }, []);

  const loop = useCallback(() => {
    drawPreview();
    rafRef.current = requestAnimationFrame(loop);
  }, [drawPreview]);

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
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
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
        if (canvas) syncCanvasToVideo(video, canvas);

        setStatus('no-face');
        setStatusHint('LOOK AT THE CAMERA TO CAPTURE');
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

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || status === 'rendering') return;

    const token = await getAccessToken();
    if (!token) {
      setErrorMsg('SIGN IN TO USE STUDIO TRY-ON');
      return;
    }

    const imageDataUrl = captureMirroredVideoJpeg(video);
    if (!imageDataUrl) {
      setErrorMsg('COULD NOT CAPTURE — TRY AGAIN');
      return;
    }

    setErrorMsg(null);
    showingResultRef.current = true;
    setStatus('rendering');
    setStatusHint('RENDERING YOUR LOOK… OUR STUDIO IS APPLYING YOUR WIG');

    try {
      const res = await postLiveTryOnStudioRenderAndWait(
        {
          imageDataUrl,
          color,
          unitKey,
          angle: activeAngle,
        },
        (msg) => setStatusHint(msg)
      );
      setResultUrl(res.imageUrl);
      setStatus('result');
      setStatusHint('STUDIO LOOK READY');
    } catch (e) {
      showingResultRef.current = false;
      setStatus('ready');
      setStatusHint('CENTER YOUR FACE — TAP CAPTURE WHEN READY');
      setErrorMsg(e instanceof Error ? e.message.toUpperCase() : 'RENDER FAILED');
    }
  }, [activeAngle, color, status, unitKey]);

  const handleRetake = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      syncCanvasToVideo(video, canvas);
      lastVideoTimeRef.current = -1;
    }
    showingResultRef.current = false;
    setResultUrl(null);
    setErrorMsg(null);
    setStatus('ready');
    setStatusHint('CENTER YOUR FACE — TAP CAPTURE WHEN READY');
  };

  const showResult = status === 'result' && Boolean(resultUrl);

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: '9 / 16', maxHeight: 'min(78dvh, 640px)' }}
      >
        <video ref={videoRef} playsInline muted className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full object-cover" />
        {showResult ? (
          <img
            src={resultUrl!}
            alt="Studio try-on result"
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        ) : null}

        <div
          className="pointer-events-none absolute left-0 right-0 px-3 text-center z-20"
          style={{ top: '10px', fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#FFFFFF', textTransform: 'uppercase' }}
        >
          {statusHint}
        </div>

        {status === 'rendering' ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 gap-2">
            <div
              className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"
              aria-hidden
            />
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#FFFFFF', textTransform: 'uppercase' }}>
              RENDERING YOUR LOOK…
            </p>
          </div>
        ) : null}

        {(status === 'loading' || status === 'permission') && !showResult ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
            <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF' }}>{statusHint}</p>
          </div>
        ) : null}
      </div>

      {errorMsg ? (
        <p
          className="text-center uppercase"
          style={{ fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#EB1C24', lineHeight: 1.5 }}
        >
          {errorMsg}
        </p>
      ) : null}

      <div className="flex flex-col gap-2">
        {showResult ? (
          <>
            <button
              type="button"
              onClick={handleRetake}
              className="w-full py-3 border border-black bg-white/80 uppercase"
              style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000' }}
            >
              CAPTURE AGAIN
            </button>
            <a
              href={resultUrl!}
              download="frontal-slayer-studio-tryon.webp"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 border border-black bg-white/80 uppercase text-center block"
              style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#EB1C24' }}
            >
              SAVE IMAGE
            </a>
          </>
        ) : (
          <button
            type="button"
            onClick={handleCapture}
            disabled={status === 'rendering' || status === 'loading' || status === 'permission'}
            className="w-full py-3 border border-black uppercase disabled:opacity-40"
            style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF', backgroundColor: '#EB1C24' }}
          >
            CAPTURE STUDIO LOOK
          </button>
        )}
      </div>

      <p
        className="text-center uppercase"
        style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', lineHeight: 1.5 }}
      >
        STUDIO USES GPT IMAGE 2 WITH EDITORIAL BLUR & CENTER PART. ANGLE: {activeAngle.toUpperCase()}.
      </p>
    </div>
  );
}
