import { createContext, useContext, useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
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
};

function readRefMapFromUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const params = new URLSearchParams(window.location.search);
  return params.get('loaderRefMap') === '1' || params.get('loaderDebug') === '1';
}

/**
 * Letterbox viewport centers one artboard scaler. The artboard is authored at 711×1536
 * reference px and receives a single transform:scale() — background, overlays, and type
 * scale together as one composition (no per-element viewport compensation).
 */
export function LoaderCompositionProvider({ children }: ProviderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const artboardRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageWidth, setStageWidth] = useState<number>(ASSTS_LOADER_REFERENCE_CANVAS.width);
  const [stageHeight, setStageHeight] = useState<number>(ASSTS_LOADER_REFERENCE_CANVAS.height);
  const [refMapMode, setRefMapModeState] = useState(readRefMapFromUrl);
  const regionElementsRef = useRef(new Map<string, HTMLElement>());
  const [, bump] = useState(0);

  const setRefMapMode = (on: boolean) => {
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
  };

  useEffect(() => {
    setRefMapModeState(isLoaderRefMapEnabled() || isLoaderDebugEnabled());
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const safeTop = parseFloat(getComputedStyle(el).paddingTop) || 0;
      const safeBottom = parseFloat(getComputedStyle(el).paddingBottom) || 0;
      const safeLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
      const safeRight = parseFloat(getComputedStyle(el).paddingRight) || 0;
      const availW = Math.max(1, rect.width - safeLeft - safeRight);
      const availH = Math.max(1, rect.height - safeTop - safeBottom);
      const scaleW = availW / ASSTS_LOADER_REFERENCE_CANVAS.width;
      const scaleH = availH / ASSTS_LOADER_REFERENCE_CANVAS.height;
      const nextScale = Math.min(scaleW, scaleH);
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

  const registerRegion = (id: string, node: HTMLElement | null) => {
    if (node) regionElementsRef.current.set(id, node);
    else regionElementsRef.current.delete(id);
    bump((n) => n + 1);
  };

  return (
    <LoaderCompositionContext.Provider
      value={{
        scale,
        stageWidth,
        stageHeight,
        refMapMode,
        setRefMapMode,
        registerRegion,
        regionElements: regionElementsRef.current,
        artboardRef,
      }}
    >
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
