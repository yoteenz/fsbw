import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ASSTS_LOADER_REFERENCE_CANVAS } from './loader-composition-map';
import { isLoaderDebugEnabled, isLoaderRefMapEnabled } from './site00LoaderHeroStage';

type LoaderCompositionContextValue = {
  scale: number;
  stageWidth: number;
  stageHeight: number;
  refMapMode: boolean;
  setRefMapMode: (on: boolean) => void;
  registerRegion: (id: string, el: HTMLElement | null) => void;
  regionElements: Map<string, HTMLElement>;
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

export function LoaderCompositionProvider({ children }: ProviderProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
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
      }}
    >
      <div ref={viewportRef} className="site00-loader-stage-viewport">
        <div
          className="site00-loader-stage"
          data-composition-id="assts-loader-mobile-v1"
          style={{
            ['--loader-scale' as string]: String(scale),
            ['--loader-ref-w' as string]: String(ASSTS_LOADER_REFERENCE_CANVAS.width),
            ['--loader-ref-h' as string]: String(ASSTS_LOADER_REFERENCE_CANVAS.height),
            width: stageWidth,
            height: stageHeight,
          }}
        >
          {children}
        </div>
      </div>
    </LoaderCompositionContext.Provider>
  );
}
