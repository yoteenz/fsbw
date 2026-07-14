import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useV3Workspace } from '../context/V3WorkspaceContext';
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

/** Horizontal viewport pager — snap paging inside the V2 viewport room. */
export function V3WorkspaceViewportPager({ renderPane }: Props) {
  const { activeWorkspace, setWorkspace, swipeWorkspace } = useV3Workspace();
  const activeIndex = resolveV3WorkspaceIndex(activeWorkspace);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startIndex: number; lastX: number; lastT: number; velocity: number } | null>(null);
  const [dragOffsetPct, setDragOffsetPct] = useState(0);
  const [animating, setAnimating] = useState(true);

  const translatePct = -(activeIndex * 100) + dragOffsetPct;

  const shouldMount = useCallback(
    (index: number) => Math.abs(index - activeIndex) <= 1,
    [activeIndex]
  );

  const commitSwipe = useCallback(
    (direction: -1 | 1) => {
      setAnimating(true);
      setDragOffsetPct(0);
      swipeWorkspace(direction);
    },
    [swipeWorkspace]
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
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

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !trackRef.current) return;
    const width = trackRef.current.clientWidth || 1;
    const deltaPx = e.clientX - drag.startX;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.velocity = (e.clientX - drag.lastX) / dt;
    drag.lastX = e.clientX;
    drag.lastT = now;
    setDragOffsetPct((deltaPx / width) * 100);
  }, []);

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

      if (Math.abs(drag.velocity) > VELOCITY_THRESHOLD) {
        commitSwipe(drag.velocity < 0 ? 1 : -1);
        return;
      }
      if (ratio <= -SWIPE_COMMIT_RATIO) commitSwipe(1);
      else if (ratio >= SWIPE_COMMIT_RATIO) commitSwipe(-1);
    },
    [commitSwipe]
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

  return (
    <div
      className="elab-v3-viewport-pager elab-stage"
      {...{ [ELAB_V3_COMPOSITION.workspaceStage]: '' }}
      data-elab-v3-active-workspace={activeWorkspace}
    >
      <V3WorkspaceSegmentedControl activeWorkspace={activeWorkspace} onSelect={setWorkspace} />

      <div
        ref={trackRef}
        className="elab-v3-viewport-pager__viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div
          className="elab-v3-viewport-pager__track"
          style={{
            transform: `translate3d(${translatePct}%, 0, 0)`,
            transition: animating ? `transform ${SPRING_MS}ms cubic-bezier(0.22, 1, 0.36, 1)` : 'none',
          }}
        >
          {V3_CORE_WORKSPACES.map((ws, index) => (
            <div key={ws.id} className="elab-v3-viewport-pager__page" data-workspace={ws.id}>
              {shouldMount(index) ? renderPane(ws.id) : <div className="elab-v3-viewport-pager__placeholder" aria-hidden />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
