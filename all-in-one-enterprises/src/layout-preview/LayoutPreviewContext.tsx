import { createContext, useContext, type ReactNode } from 'react';
import type { AioLayoutPreviewMode } from './layoutPreviewMode';

const LayoutPreviewContext = createContext<AioLayoutPreviewMode>('responsive');

export function LayoutPreviewProvider({
  mode,
  children,
}: {
  mode: AioLayoutPreviewMode;
  children: ReactNode;
}) {
  return <LayoutPreviewContext.Provider value={mode}>{children}</LayoutPreviewContext.Provider>;
}

export function useLayoutPreviewMode(): AioLayoutPreviewMode {
  return useContext(LayoutPreviewContext);
}

/** True when viewing under /desktop/* or /mobile/* preview mirrors. */
export function useIsLayoutPreviewRoute(): boolean {
  const mode = useLayoutPreviewMode();
  return mode === 'desktop' || mode === 'mobile';
}
