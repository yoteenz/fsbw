import { useEffect, useState, type CSSProperties } from 'react';

/** Shared hero image layout — order form, brand member, etc. */
export const PAGE_HERO_IMAGE_STYLE: CSSProperties = {
  width: '75%',
  height: 'auto',
  display: 'block',
  objectFit: 'contain',
  marginTop: '22px',
  marginBottom: '12px',
  marginLeft: 'auto',
  marginRight: 'auto',
};

type PageHeroImageProps = {
  /** Poster / static fallback (also used as `poster` when `videoSrc` is set). */
  src: string;
  /** When set, plays a looped muted inline video over the hero slot. */
  videoSrc?: string;
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

export default function PageHeroImage({ src, videoSrc }: PageHeroImageProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoReady, setVideoReady] = useState(false);

  if (!videoSrc || prefersReducedMotion) {
    return <img src={src} alt="" style={PAGE_HERO_IMAGE_STYLE} />;
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '75%',
        marginTop: '22px',
        marginBottom: '12px',
        marginLeft: 'auto',
        marginRight: 'auto',
      }}
    >
      <img
        src={src}
        alt=""
        aria-hidden
        draggable={false}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
          opacity: videoReady ? 0 : 1,
          transition: 'opacity 0.2s ease-out',
        }}
      />
      <video
        src={videoSrc}
        poster={src}
        preload="auto"
        playsInline
        muted
        loop
        autoPlay
        aria-hidden
        onLoadedData={() => setVideoReady(true)}
        onCanPlay={() => setVideoReady(true)}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          opacity: videoReady ? 1 : 0,
          transition: 'opacity 0.2s ease-out',
          backgroundColor: 'transparent',
        }}
      />
    </div>
  );
}
