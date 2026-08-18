import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react';
import { ASSTS_LOADER_REFERENCE_CANVAS, ASSTS_LOADER_TYPOGRAPHY } from './loader-composition-map';
import { isLoaderDebugEnabled, isLoaderRefMapEnabled } from './site00LoaderHeroStage';

type LoaderCompositionContextValue = {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  refMapMode: boolean;
  setRefMapMode: (on: boolean) => void;
  registerRegion: (id: string, el: HTMLElement | null) => void;
  regionElements: Map<string, HTMLElement>;
  artboardRef: RefObject<HTMLDivElement | null>;
};

const LoaderCompositionContext = createContext<LoaderCompositionContextValue | null>(null);

export function useLoaderComposition() {
  const ctx = useContext(LoaderCompositionContext);
  if (!ctx) {
    throw new Error('useLoaderComposition must be used within LoaderCompositionProvider');
  }
  return ctx;
}

export function useLoaderCompositionOptional() {
  return useContext(LoaderCompositionContext);
}

type ProviderProps = {
  children: ReactNode;
  /** Edge-to-edge environment — scales in lockstep with the overlay artboard (fill width). */
  backgroundUrl?: string;
};

function readRefMapFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('loaderRefMap') === '1' || params.get('loaderDebug') === '1';
}

/**
 * Fill viewport width with one artboard scaler (geometry + copy). Vertical overflow clips.
 * Background uses the same scale transform so overlays stay registered — no side gutters.
 */
export function LoaderCompositionProvider({ children, backgroundUrl }: ProviderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageWidth, setStageWidth] = useState<number>(ASSTS_LOADER_REFERENCE_CANVAS.width);
  const [stageHeight, setStageHeight] = useState<number>(ASSTS_LOADER_REFERENCE_CANVAS.height);
  const [refMapMode, setRefMapModeState] = useState(readRefMapFromUrl);
  const regionElementsRef = useRef(new Map<string, HTMLElement>());
  const [, bump] = useState(0);

  const setRefMapMode = useCallback((on: boolean) => {
    setRefMapModeState(on);
    if (typeof window === 'undefined') return;
    const next = new URLSearchParams(window.location.search);
    if (on) next.set('loaderRefMap', '1');
    else {
      next.delete('loaderRefMap');
      if (!isLoaderDebugEnabled()) next.delete('loaderDebug');
    }
    const qs = next.toString();
    window.history.replaceState(null, '', qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, []);

  useEffect(() => {
    setRefMapModeState(isLoaderRefMapEnabled() || isLoaderDebugEnabled());
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const safeLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const safeRight = parseFloat(getComputedStyle(el).paddingRight) || 0;
      const availW = Math.max(1, rect.width - safeLeft - safeRight);
      const scaleW = availW / ASSTS_LOADER_REFERENCE_CANVAS.width;
      const nextScale = scaleW;
      setScale(nextScale);
      setStageWidth(ASSTS_LOADER_REFERENCE_CANVAS.width * nextScale);
      setStageHeight(ASSTS_LOADER_REFERENCE_CANVAS.height * nextScale);
      el.style.setProperty('--loader-scale', String(nextScale));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  const registerRegion = useCallback((id: string, node: HTMLElement | null) => {
    if (node) {
      if (regionElementsRef.current.get(id) === node) return;
      regionElementsRef.current.set(id, node);
    } else {
      if (!regionElementsRef.current.has(id)) return;
      regionElementsRef.current.delete(id);
    }
    bump((n) => n + 1);
  }, []);

  const contextValue = useMemo(
    () => ({
      scale,
      stageWidth,
      stageHeight,
      refMapMode,
      setRefMapMode,
      registerRegion,
      regionElements: regionElementsRef.current,
      artboardRef,
    }),
    [scale, stageWidth, stageHeight, refMapMode, setRefMapMode, registerRegion],
  );

  return (
    <LoaderCompositionContext.Provider value={contextValue}>
      {backgroundUrl ? (
        <div className="site00-immersive-loader__backdrop" aria-hidden="true">
          <img
            className="site00-immersive-loader__backdrop-img"
            src={backgroundUrl}
            alt=""
            decoding="async"
            fetchPriority="high"
            draggable={false}
            style={{
              width: ASSTS_LOADER_REFERENCE_CANVAS.width,
              height: ASSTS_LOADER_REFERENCE_CANVAS.height,
              transform: `scale(${scale})`,
            }}
          />
        </div>
      ) : null}
      <div ref={viewportRef} className="site00-loader-viewport site00-loader-stage-viewport">
        <div
          className="site00-loader-artboard-scaler"
          style={{
            width: stageWidth,
            height: stageHeight,
          }}
        >
          <div
            ref={artboardRef}
            className="site00-loader-artboard site00-loader-stage"
            data-composition-id="assts-loader-mobile-v2"
            data-artboard-w={ASSTS_LOADER_REFERENCE_CANVAS.width}
            data-artboard-h={ASSTS_LOADER_REFERENCE_CANVAS.height}
            style={{
              width: ASSTS_LOADER_REFERENCE_CANVAS.width,
              height: ASSTS_LOADER_REFERENCE_CANVAS.height,
              transform: `scale(${scale})`,
              ['--loader-type-eyebrow-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.eyebrow.size}px`,
              ['--loader-type-title-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.title.size}px`,
              ['--loader-type-subtitle-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.subtitle.size}px`,
              ['--loader-type-status-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.status.size}px`,
              ['--loader-type-pct-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.progressPct.size}px`,
              ['--loader-type-tagline-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.tagline.size}px`,
              ['--loader-type-tagline-plus-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.taglinePlus.size}px`,
              ['--loader-type-mark-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.mark.size}px`,
              ['--loader-type-signature-size' as string]: `${ASSTS_LOADER_TYPOGRAPHY.signatureLabel.size}px`,
            }}
          >
            {children}
          </div>
        </div>
      </div>
    </LoaderCompositionContext.Provider>
  );
}
