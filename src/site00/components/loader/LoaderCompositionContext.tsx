import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from 'react';
import { ASSTS_LOADER_REFERENCE_CANVAS, ASSTS_LOADER_TYPOGRAPHY } from './loader-composition-map';
import { isLoaderDebugEnabled, isLoaderRefMapEnabled } from './site00LoaderHeroStage';

type LoaderCompositionContextValue = {
  /** Viewport width / reference width — for debug measurements only. */
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

function applyViewportTypography(stage: HTMLElement, scaleX: number, scaleY: number): void {
  const t = ASSTS_LOADER_TYPOGRAPHY;
  stage.style.setProperty('--loader-type-eyebrow-size', `${t.eyebrow.size * scaleX}px`);
  stage.style.setProperty('--loader-type-title-size', `${t.title.size * scaleX}px`);
  stage.style.setProperty('--loader-type-subtitle-size', `${t.subtitle.size * scaleX}px`);
  stage.style.setProperty('--loader-type-status-size', `${t.status.size * scaleX}px`);
  stage.style.setProperty('--loader-type-pct-size', `${t.progressPct.size * scaleX}px`);
  stage.style.setProperty('--loader-type-tagline-size', `${t.tagline.size * scaleX}px`);
  stage.style.setProperty('--loader-type-tagline-plus-size', `${t.taglinePlus.size * scaleX}px`);
  stage.style.setProperty('--loader-type-mark-size', `${t.mark.size * scaleX}px`);
  stage.style.setProperty('--loader-type-signature-size', `${t.signatureLabel.size * scaleX}px`);
  stage.style.setProperty('--loader-progress-track-h', `${8 * scaleY}px`);
}

/**
 * ONE full-viewport stage — 711×1536 is the coordinate system only (normalized %).
 * Background, animation overlay, and UI share the same 100vw × 100dvh plane.
 */
export function LoaderCompositionProvider({ children }: ProviderProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [stageWidth, setStageWidth] = useState(0);
  const [stageHeight, setStageHeight] = useState(0);
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
    const el = stageRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const w = Math.max(1, rect.width);
      const h = Math.max(1, rect.height);
      const scaleX = w / ASSTS_LOADER_REFERENCE_CANVAS.width;
      const scaleY = h / ASSTS_LOADER_REFERENCE_CANVAS.height;
      setScale(scaleX);
      setStageWidth(w);
      setStageHeight(h);
      el.style.setProperty('--loader-vw-scale', String(scaleX));
      el.style.setProperty('--loader-vh-scale', String(scaleY));
      applyViewportTypography(el, scaleX, scaleY);
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
      artboardRef: stageRef,
    }),
    [scale, stageWidth, stageHeight, refMapMode, setRefMapMode, registerRegion],
  );

  return (
    <LoaderCompositionContext.Provider value={contextValue}>
      <div className="site00-loader-viewport site00-loader-stage-viewport">
        <div
          ref={stageRef}
          className="site00-loader-stage"
          data-composition-id="assts-loader-mobile-v2"
          data-artboard-w={ASSTS_LOADER_REFERENCE_CANVAS.width}
          data-artboard-h={ASSTS_LOADER_REFERENCE_CANVAS.height}
        >
          {children}
        </div>
      </div>
    </LoaderCompositionContext.Provider>
  );
}
