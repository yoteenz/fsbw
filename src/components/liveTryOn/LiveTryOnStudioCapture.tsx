import { useCallback, useEffect, useRef, useState } from 'react';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import {
  LIVE_TRY_ON_FACE_LANDMARKER_MODEL,
  LIVE_TRY_ON_MEDIAPIPE_WASM_BASE,
} from '../../constants/liveTryOnSpikeAssets';
import {
  getAccessToken,
  postLiveTryOnStudioMakeupAndWait,
  postLiveTryOnStudioRenderAndWait,
} from '../../utils/api';
import { captureMirroredVideoJpeg } from '../../utils/liveTryOnCapture';
import { estimateHeadYawNorm, pickWigViewFromYaw } from '../../utils/liveTryOnYaw';

type Status = 'loading' | 'permission' | 'ready' | 'no-face' | 'rendering' | 'result' | 'error';
type RenderPhase = 'base' | 'makeup' | null;

type Props = {
  color: string;
  unitKey: string;
};

const STUDIO_BASE_ESTIMATE_MS = 120_000;
const STUDIO_MAKEUP_ESTIMATE_MS = 90_000;

function syncCanvasToVideo(video: HTMLVideoElement, canvas: HTMLCanvasElement): void {
  const vw = video.videoWidth;
  const vh = video.videoHeight;
  if (vw > 0 && vh > 0 && (canvas.width !== vw || canvas.height !== vh)) {
    canvas.width = vw;
    canvas.height = vh;
  }
}

function StudioRenderOverlay({
  label,
  progress,
}: {
  label: string;
  progress: number;
}) {
  const pct = Math.round(Math.min(1, Math.max(0, progress)) * 100);
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/55 gap-3 px-10">
      <div
        className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"
        aria-hidden
      />
      <p
        style={{ fontFamily: '"Futura PT Medium"', fontSize: '10px', color: '#FFFFFF', textTransform: 'uppercase' }}
      >
        {label}
      </p>
      <div className="w-full max-w-[220px] h-1 rounded-full overflow-hidden bg-white/20">
        <div
          className="h-full bg-white transition-[width] duration-200 ease-linear"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
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
  const [captureSnapshotUrl, setCaptureSnapshotUrl] = useState<string | null>(null);
  const [renderPhase, setRenderPhase] = useState<RenderPhase>(null);
  const [renderProgress, setRenderProgress] = useState(0);
  const [studioJobId, setStudioJobId] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [makeupResultUrl, setMakeupResultUrl] = useState<string | null>(null);
  const [showMakeup, setShowMakeup] = useState(false);
  const [showMakeupPrompt, setShowMakeupPrompt] = useState(false);
  const [makeupOfferPending, setMakeupOfferPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeAngle, setActiveAngle] = useState<'left' | 'front' | 'right'>('front');

  useEffect(() => {
    if (!renderPhase) return;
    const estimate = renderPhase === 'base' ? STUDIO_BASE_ESTIMATE_MS : STUDIO_MAKEUP_ESTIMATE_MS;
    const startedAt = Date.now();
    setRenderProgress(0);
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setRenderProgress(Math.min(0.95, elapsed / estimate));
    }, 100);
    return () => clearInterval(id);
  }, [renderPhase]);

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

    if (showingResultRef.current || renderPhase === 'base') return;

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
  }, [renderPhase]);

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

  const runMakeupPass = useCallback(async () => {
    if (!studioJobId || renderPhase) return;

    setErrorMsg(null);
    setShowMakeupPrompt(false);
    setMakeupOfferPending(false);
    setRenderProgress(0);
    setRenderPhase('makeup');

    try {
      const res = await postLiveTryOnStudioMakeupAndWait(studioJobId);
      setRenderProgress(1);
      setMakeupResultUrl(res.makeupImageUrl ?? null);
      setShowMakeup(Boolean(res.makeupImageUrl));
      setMakeupOfferPending(!res.makeupImageUrl);
      setStudioJobId(null);
    } catch (e) {
      setMakeupOfferPending(true);
      setErrorMsg(e instanceof Error ? e.message.toUpperCase() : 'MAKEUP RENDER FAILED');
    } finally {
      setRenderPhase(null);
      setRenderProgress(0);
    }
  }, [renderPhase, studioJobId]);

  const handleCapture = useCallback(async () => {
    const video = videoRef.current;
    if (!video || status === 'rendering' || renderPhase) return;

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
    setCaptureSnapshotUrl(imageDataUrl);
    setRenderPhase('base');
    setRenderProgress(0);
    setStatus('rendering');
    setResultUrl(null);
    setMakeupResultUrl(null);
    setShowMakeup(false);
    setShowMakeupPrompt(false);
    setMakeupOfferPending(false);
    setStudioJobId(null);

    try {
      const res = await postLiveTryOnStudioRenderAndWait(
        {
          imageDataUrl,
          color,
          unitKey,
          angle: activeAngle,
        },
        () => {
          /* progress label lives in overlay */
        }
      );
      setRenderProgress(1);
      showingResultRef.current = true;
      setResultUrl(res.imageUrl);
      setStudioJobId(res.jobId);
      setStatus('result');
      setStatusHint('STUDIO LOOK READY');
      setRenderPhase(null);
      setRenderProgress(0);
      if (res.makeupAvailable && !res.makeupImageUrl) {
        setShowMakeupPrompt(true);
      }
    } catch (e) {
      showingResultRef.current = false;
      setCaptureSnapshotUrl(null);
      setRenderPhase(null);
      setRenderProgress(0);
      setStatus('ready');
      setStatusHint('CENTER YOUR FACE — TAP CAPTURE WHEN READY');
      setErrorMsg(e instanceof Error ? e.message.toUpperCase() : 'RENDER FAILED');
    }
  }, [activeAngle, color, renderPhase, status, unitKey]);

  const handleRetake = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (video && canvas) {
      syncCanvasToVideo(video, canvas);
      lastVideoTimeRef.current = -1;
    }
    showingResultRef.current = false;
    setCaptureSnapshotUrl(null);
    setRenderPhase(null);
    setRenderProgress(0);
    setStudioJobId(null);
    setResultUrl(null);
    setMakeupResultUrl(null);
    setShowMakeup(false);
    setShowMakeupPrompt(false);
    setMakeupOfferPending(false);
    setErrorMsg(null);
    setStatus('ready');
    setStatusHint('CENTER YOUR FACE — TAP CAPTURE WHEN READY');
  };

  const handleMakeupCancel = () => {
    setShowMakeupPrompt(false);
    setMakeupOfferPending(true);
  };

  const showResult = status === 'result' && Boolean(resultUrl);
  const displayedResultUrl = showMakeup && makeupResultUrl ? makeupResultUrl : resultUrl;
  const canToggleMakeup = Boolean(makeupResultUrl);
  const showSnapshot = renderPhase === 'base' && Boolean(captureSnapshotUrl);
  const showLiveCanvas = !showResult && !showSnapshot;
  const overlayLabel =
    renderPhase === 'makeup' ? 'ADDING PHOTO-READY MAKEUP…' : 'RENDERING YOUR LOOK…';

  return (
    <div className="flex flex-col gap-3 w-full">
      <div
        className="relative w-full overflow-hidden bg-black"
        style={{ aspectRatio: '9 / 16', maxHeight: 'min(78dvh, 640px)' }}
      >
        <video ref={videoRef} playsInline muted className="absolute w-px h-px opacity-0 pointer-events-none" aria-hidden />
        <canvas
          ref={canvasRef}
          className={`absolute inset-0 w-full h-full object-cover ${showLiveCanvas ? '' : 'opacity-0 pointer-events-none'}`}
        />

        {showSnapshot ? (
          <img
            src={captureSnapshotUrl!}
            alt="Captured selfie"
            className="absolute inset-0 w-full h-full object-cover z-[5]"
          />
        ) : null}

        {showResult && displayedResultUrl ? (
          <img
            src={displayedResultUrl}
            alt={showMakeup ? 'Studio try-on with makeup' : 'Studio try-on natural'}
            className="absolute inset-0 w-full h-full object-cover z-10"
          />
        ) : null}

        {showResult && canToggleMakeup && !renderPhase ? (
          <button
            type="button"
            onClick={() => setShowMakeup((v) => !v)}
            className="absolute z-30 flex items-center justify-center rounded-full border border-white/70 bg-black/45 p-2.5"
            style={{ right: '12px', bottom: '12px' }}
            aria-label={showMakeup ? 'Show natural look' : 'Show makeup look'}
            aria-pressed={showMakeup}
          >
            <img
              src="/assets/makeup-artist-icon.svg"
              alt=""
              className="w-6 h-6"
              style={{ opacity: showMakeup ? 1 : 0.72 }}
            />
          </button>
        ) : null}

        {renderPhase ? (
          <StudioRenderOverlay label={overlayLabel} progress={renderProgress} />
        ) : null}

        {!renderPhase && !showMakeupPrompt && status !== 'loading' && status !== 'permission' && !showResult ? (
          <div
            className="pointer-events-none absolute left-0 right-0 px-3 text-center z-20"
            style={{ top: '10px', fontFamily: '"Futura PT Medium"', fontSize: '9px', color: '#FFFFFF', textTransform: 'uppercase' }}
          >
            {statusHint}
          </div>
        ) : null}

        {showMakeupPrompt ? (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/65 px-5">
            <div
              className="w-full max-w-[300px] border border-black bg-white/95 p-5 flex flex-col gap-4"
              role="dialog"
              aria-labelledby="studio-makeup-prompt-title"
            >
              <p
                id="studio-makeup-prompt-title"
                className="text-center uppercase"
                style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000', lineHeight: 1.5 }}
              >
                ADD PHOTO-READY MAKEUP TO YOUR FINAL IMAGE?
              </p>
              <p
                className="text-center uppercase"
                style={{ fontFamily: '"Futura PT Book"', fontSize: '8px', color: '#808080', lineHeight: 1.5 }}
              >
                VERY LIGHT NATURAL MAKEUP — OPTIONAL
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => void runMakeupPass()}
                  className="w-full py-3 border border-black uppercase"
                  style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF', backgroundColor: '#EB1C24' }}
                >
                  PROCEED
                </button>
                <button
                  type="button"
                  onClick={handleMakeupCancel}
                  className="w-full py-3 border border-black bg-white/80 uppercase"
                  style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000' }}
                >
                  CANCEL
                </button>
              </div>
            </div>
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
            {makeupOfferPending && !makeupResultUrl && !renderPhase ? (
              <button
                type="button"
                onClick={() => void runMakeupPass()}
                className="w-full py-3 border border-black uppercase"
                style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#FFFFFF', backgroundColor: '#EB1C24' }}
              >
                ADD MAKEUP
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleRetake}
              disabled={Boolean(renderPhase)}
              className="w-full py-3 border border-black bg-white/80 uppercase disabled:opacity-40"
              style={{ fontFamily: '"Futura PT Medium"', fontSize: '11px', color: '#000000' }}
            >
              CAPTURE AGAIN
            </button>
            <a
              href={displayedResultUrl!}
              download={showMakeup ? 'frontal-slayer-studio-tryon-makeup.webp' : 'frontal-slayer-studio-tryon-natural.webp'}
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
            disabled={status === 'rendering' || status === 'loading' || status === 'permission' || Boolean(renderPhase)}
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
