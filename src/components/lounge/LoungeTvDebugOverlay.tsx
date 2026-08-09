import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_FONT_BOOK, LOUNGE_TV_TEXT_GRAY } from './loungeTvTheme';
import type { LoungeTvMainTab } from './loungeTvContent';

type LoungeTvDebugOverlayProps = {
  mainTab: LoungeTvMainTab;
  viewKind: string;
  focusId?: string;
};

/** Dev-only TV IA / focus diagnostics. */
export function LoungeTvDebugOverlay({ mainTab, viewKind, focusId }: LoungeTvDebugOverlayProps) {
  if (!import.meta.env.DEV) return null;

  const active = document.activeElement as HTMLElement | null;
  const rail = active?.closest<HTMLElement>('[data-lounge-tv-rail]')?.dataset.loungeTvRail;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: loungeTvGlassCqw(0.5, 1.2, 2.4),
        right: loungeTvGlassCqw(0.5, 1.2, 2.4),
        zIndex: 50,
        padding: loungeTvGlassCqw(0.5, 1.2, 2.4),
        background: 'rgba(0,0,0,0.82)',
        border: '1px dashed rgba(200,120,40,0.6)',
        fontFamily: LOUNGE_TV_FONT_BOOK,
        fontSize: loungeTvGlassCqw(0.85, 1.9, 3.8),
        color: LOUNGE_TV_TEXT_GRAY,
        textTransform: 'none',
        pointerEvents: 'none',
        maxWidth: '42%',
      }}
    >
      TV DEBUG · tab={mainTab} · view={viewKind}
      {rail ? ` · rail=${rail}` : ''}
      {focusId ? ` · restore=${focusId}` : ''}
    </div>
  );
}
