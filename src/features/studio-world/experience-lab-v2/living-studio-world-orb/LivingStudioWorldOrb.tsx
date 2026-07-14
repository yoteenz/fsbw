import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject } from 'react';
import { resolveExperienceLabWorkbenchCenterLogoUrl } from '../experience-lab-v2-workbench-config';
import type { ExperienceLabV2ViewModel } from '../experience-lab-v2.types';
import styles from './LivingStudioWorldOrb.module.css';
import { ORB_APPROVED_BLOOM_MS, ORB_HIGHLIGHT_DRIFT_PX } from './orbAnimations';
import {
  deriveOrbPresentationStatus,
  orbStatusAriaLabel,
  resolveOrbStatusFromViewModel,
  type OrbStatus,
} from './orbStatusMachine';

type Props = {
  model?: ExperienceLabV2ViewModel;
  status?: OrbStatus;
  artworkSrc?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

function useAnimationPaused(rootRef: RefObject<HTMLElement | null>): boolean {
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof document === 'undefined') return;

    const onVisibility = () => {
      setPaused(document.visibilityState === 'hidden');
    };
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);

    let observer: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio > 0.05);
          setPaused(document.visibilityState === 'hidden' || !visible);
        },
        { threshold: [0, 0.05, 0.2] }
      );
      observer.observe(el);
    }

    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      observer?.disconnect();
    };
  }, [rootRef]);

  return paused;
}

function AmbientGlowLayer() {
  return <span className={`${styles.layer} ${styles.ambientGlow}`} aria-hidden />;
}

function OuterOrbitRing() {
  return <span className={`${styles.layer} ${styles.outerOrbitRing}`} aria-hidden />;
}

function InnerOrbitRing() {
  return <span className={`${styles.layer} ${styles.innerOrbitRing}`} aria-hidden />;
}

function OrbBase({ src }: { src: string }) {
  return (
    <span className={`${styles.layer} ${styles.orbBase}`} aria-hidden>
      <img className={styles.orbBaseImg} src={src} alt="" decoding="async" draggable={false} />
    </span>
  );
}

function DepthOverlay() {
  return <span className={`${styles.layer} ${styles.depthOverlay}`} aria-hidden />;
}

function InternalCore() {
  return <span className={`${styles.layer} ${styles.internalCore}`} aria-hidden />;
}

function HighlightLayer({ offset }: { offset: { x: number; y: number } }) {
  const style = {
    transform: `translate(${offset.x}px, ${offset.y}px)`,
  } as CSSProperties;

  return <span className={`${styles.layer} ${styles.highlightLayer}`} style={style} aria-hidden />;
}

function SurfaceShimmer() {
  return <span className={`${styles.layer} ${styles.surfaceShimmer}`} aria-hidden />;
}

function PulseHalo() {
  return <span className={`${styles.layer} ${styles.pulseHalo}`} aria-hidden />;
}

function AtmosphericBloom() {
  return <span className={`${styles.layer} ${styles.atmosphericBloom}`} aria-hidden />;
}

function StatusLayer({ status, approvedBloom }: { status: OrbStatus; approvedBloom: boolean }) {
  const className = useMemo(() => {
    const base = `${styles.layer} ${styles.statusLayer}`;
    if (approvedBloom) return `${base} ${styles.statusApproved}`;
    switch (status) {
      case 'GENERATING':
        return `${base} ${styles.statusGenerating}`;
      case 'WARNING':
        return `${base} ${styles.statusWarning}`;
      case 'ERROR':
        return `${base} ${styles.statusError}`;
      case 'OFFLINE':
        return `${base} ${styles.statusOffline}`;
      default:
        return base;
    }
  }, [approvedBloom, status]);

  return <span className={className} aria-hidden />;
}

/**
 * Living Studio World Orb™ — visual heartbeat of Studio World.
 * Mounts inside `.elab-founder-wb__nav-orb` without altering workbench layout.
 */
export function LivingStudioWorldOrb({ model, status: statusProp, artworkSrc }: Props) {
  const shellRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [highlightOffset, setHighlightOffset] = useState({ x: 0, y: 0 });
  const [approvedBloom, setApprovedBloom] = useState(false);
  const wasApprovedRef = useRef(false);
  const reducedMotion = usePrefersReducedMotion();
  const animationPaused = useAnimationPaused(shellRef);

  const baseStatus = statusProp ?? (model ? resolveOrbStatusFromViewModel(model) : 'IDLE');
  const presentationStatus = deriveOrbPresentationStatus(baseStatus, isHovered, isFocused);
  const ariaLabel = orbStatusAriaLabel(presentationStatus);
  const textureSrc = artworkSrc ?? resolveExperienceLabWorkbenchCenterLogoUrl();

  useEffect(() => {
    const isApproved =
      model?.approvalStatus.trim().toLowerCase() === 'approved' && model.approval.approvalRecorded;
    if (isApproved && !wasApprovedRef.current) {
      setApprovedBloom(true);
      const timer = window.setTimeout(() => setApprovedBloom(false), ORB_APPROVED_BLOOM_MS);
      wasApprovedRef.current = true;
      return () => window.clearTimeout(timer);
    }
    if (!isApproved) {
      wasApprovedRef.current = false;
    }
    return undefined;
  }, [model?.approvalStatus, model?.approval.approvalRecorded]);

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reducedMotion) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (event.clientX - cx) / (rect.width / 2);
      const dy = (event.clientY - cy) / (rect.height / 2);
      const clampedX = Math.max(-1, Math.min(1, dx)) * ORB_HIGHLIGHT_DRIFT_PX;
      const clampedY = Math.max(-1, Math.min(1, dy)) * ORB_HIGHLIGHT_DRIFT_PX;
      setHighlightOffset({ x: clampedX, y: clampedY });
    },
    [reducedMotion]
  );

  const shellClass = [
    styles.shell,
    !reducedMotion ? styles.shellMotion : '',
    isHovered ? styles.shellHover : '',
    isFocused ? styles.shellFocus : '',
    animationPaused ? styles.shellPaused : '',
    reducedMotion ? styles.reducedMotion : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={shellRef}
      className={`elab-founder-wb__nav-orb ${styles.root}`}
      role="img"
      aria-label={ariaLabel}
      tabIndex={0}
      onPointerEnter={() => setIsHovered(true)}
      onPointerLeave={() => {
        setIsHovered(false);
        setHighlightOffset({ x: 0, y: 0 });
      }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onPointerMove={onPointerMove}
    >
      <div className={shellClass}>
        <div className={styles.stack}>
          <div className={styles.breatheWrap}>
            <div className={styles.hoverLift}>
              <AmbientGlowLayer />
              <OuterOrbitRing />
              <InnerOrbitRing />
              <OrbBase src={textureSrc} />
              <DepthOverlay />
              <InternalCore />
              <HighlightLayer offset={highlightOffset} />
              <SurfaceShimmer />
              <PulseHalo />
              <AtmosphericBloom />
              <StatusLayer status={baseStatus} approvedBloom={approvedBloom} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
