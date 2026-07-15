import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useV3Workspace, V3_PAGE_WIDTH_PCT } from '../context/ExperienceLabV3WorkspaceProvider';
import { ELAB_V3_COMPOSITION } from '../experience-lab-v3-composition';
import { resolveV3WorkspaceIndex, V3_CORE_WORKSPACES } from '../registry/v3-workspace-registry';
import type { V3CoreWorkspaceId } from '../experience-lab-v3.types';
import { V3WorkspaceSegmentedControl } from './V3WorkspaceSegmentedControl';

const SPRING_MS = 480;
const SWIPE_COMMIT_RATIO = 0.22;
const VELOCITY_THRESHOLD = 0.35;

type PaneRender = (workspaceId: V3CoreWorkspaceId) => ReactNode;

type Props = {
  renderPane: PaneRender;
};

/** Horizontal viewport pager — transform-based snap paging inside the V2 viewport room. */
export function V3WorkspaceViewportPager({ renderPane }: Props) {
  const { activeWorkspace, setWorkspace, swipeWorkspace, setPagerOffset, setSwipeProgress } = useV3Workspace();
  const activeIndex = resolveV3WorkspaceIndex(activeWorkspace);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startIndex: number; lastX: number; lastT: number; velocity: number } | null>(null);
  const [dragOffsetPct, setDragOffsetPct] = useState(0);
  const [animating, setAnimating] = useState(true);

  const translatePct = -(activeIndex * V3_PAGE_WIDTH_PCT) + dragOffsetPct;

  const shouldMount = useCallback(
    (index: number) => Math.abs(index - activeIndex) <= 1,
    [activeIndex]
  );

  const commitSwipe = useCallback(
    (direction: -1 | 1) => {
      setAnimating(true);
      setDragOffsetPct(0);
      setPagerOffset(0);
      setSwipeProgress(0);
      swipeWorkspace(direction);
    },
    [swipeWorkspace, setPagerOffset, setSwipeProgress]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, textarea, select, [data-v3-no-swipe]')) return;
      if (e.button !== 0) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = {
        startX: e.clientX,
        startIndex: activeIndex,
        lastX: e.clientX,
        lastT: performance.now(),
        velocity: 0,
      };
      setAnimating(false);
    },
    [activeIndex]
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || !trackRef.current) return;
      const width = trackRef.current.clientWidth || 1;
      const deltaPx = e.clientX - drag.startX;
      const now = performance.now();
      const dt = Math.max(1, now - drag.lastT);
      drag.velocity = (e.clientX - drag.lastX) / dt;
      drag.lastX = e.clientX;
      drag.lastT = now;
      const offset = (deltaPx / width) * V3_PAGE_WIDTH_PCT;
      setDragOffsetPct(offset);
      setPagerOffset(offset);
      setSwipeProgress(Math.min(1, Math.abs(deltaPx / width)));
    },
    [setPagerOffset, setSwipeProgress]
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const drag = dragRef.current;
      if (!drag || !trackRef.current) return;
      e.currentTarget.releasePointerCapture(e.pointerId);
      dragRef.current = null;
      const width = trackRef.current.clientWidth || 1;
      const deltaPx = e.clientX - drag.startX;
      const ratio = deltaPx / width;
      setAnimating(true);
      setDragOffsetPct(0);
      setPagerOffset(0);
      setSwipeProgress(0);

      if (Math.abs(drag.velocity) > VELOCITY_THRESHOLD) {
        commitSwipe(drag.velocity < 0 ? 1 : -1);
        return;
      }
      if (ratio <= -SWIPE_COMMIT_RATIO) commitSwipe(1);
      else if (ratio >= SWIPE_COMMIT_RATIO) commitSwipe(-1);
    },
    [commitSwipe, setPagerOffset, setSwipeProgress]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        commitSwipe(1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        commitSwipe(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commitSwipe]);

  const handleSegmentSelect = useCallback(
    (id: V3CoreWorkspaceId) => {
      setAnimating(true);
      setDragOffsetPct(0);
      setWorkspace(id);
    },
    [setWorkspace]
  );

  const reducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      className="elab-v3-viewport-pager elab-stage"
      {...{ [ELAB_V3_COMPOSITION.workspaceStage]: '' }}
      data-elab-v3-active-workspace={activeWorkspace}
      data-elab-v3-pager-index={activeIndex}
    >
      <V3WorkspaceSegmentedControl activeWorkspace={activeWorkspace} onSelect={handleSegmentSelect} />

      <div
        ref={trackRef}
        className="elab-v3-viewport-pager__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        role="region"
        aria-label="Experience Lab workspace pager"
        aria-roledescription="carousel"
      >
        <div
          className="elab-v3-viewport-pager__track"
          style={{
            transform: `translate3d(${translatePct}%, 0, 0)`,
            transition:
              animating && !reducedMotion
                ? `transform ${SPRING_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
                : 'none',
          }}
        >
          {V3_CORE_WORKSPACES.map((ws, index) => (
            <div
              key={ws.id}
              className="elab-v3-viewport-pager__page"
              data-workspace={ws.id}
              aria-hidden={index !== activeIndex}
            >
              {shouldMount(index) ? (
                renderPane(ws.id)
              ) : (
                <div className="elab-v3-viewport-pager__placeholder" aria-hidden>
                  <span className="elab-v3-viewport-pager__placeholder-label">{ws.label}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
