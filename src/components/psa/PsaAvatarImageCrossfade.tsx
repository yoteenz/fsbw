import { useEffect, useRef, useState, type SyntheticEvent } from 'react';
import {
  getPsaAvatarSrc,
  PSA_AVATAR_FALLBACK_SRC,
  PSA_EXPRESSION_CROSSFADE_MS,
  type PsaAvatarExpression,
} from '../../constants/psaConfig';

type PsaAvatarImageCrossfadeProps = {
  expression: PsaAvatarExpression;
};

function handleImgError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src.includes('profile-thumb.png')) return;
  const neutralBase = PSA_AVATAR_FALLBACK_SRC;
  if (!img.src.includes(neutralBase.replace(/^\//, ''))) {
    img.src = getPsaAvatarSrc('neutral');
    return;
  }
  img.src = '/assets/profile-thumb.png';
}

/**
 * Crossfades between avatar PNGs instead of hard-swapping (key remount).
 */
export default function PsaAvatarImageCrossfade({ expression }: PsaAvatarImageCrossfadeProps) {
  const [front, setFront] = useState<{ expression: PsaAvatarExpression; src: string }>(() => ({
    expression,
    src: getPsaAvatarSrc(expression),
  }));
  const [back, setBack] = useState<{ expression: PsaAvatarExpression; src: string } | null>(null);
  const [backVisible, setBackVisible] = useState(false);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fadeStartRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (expression === front.expression) return;

    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    if (fadeStartRef.current != null) cancelAnimationFrame(fadeStartRef.current);

    const incoming = { expression, src: getPsaAvatarSrc(expression) };
    setBack(incoming);
    setBackVisible(false);

    fadeStartRef.current = requestAnimationFrame(() => {
      fadeStartRef.current = requestAnimationFrame(() => setBackVisible(true));
    });

    transitionTimerRef.current = setTimeout(() => {
      setFront(incoming);
      setBack(null);
      setBackVisible(false);
      transitionTimerRef.current = null;
    }, PSA_EXPRESSION_CROSSFADE_MS);

    return () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (fadeStartRef.current != null) cancelAnimationFrame(fadeStartRef.current);
    };
  }, [expression, front.expression]);

  useEffect(
    () => () => {
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (fadeStartRef.current != null) cancelAnimationFrame(fadeStartRef.current);
    },
    []
  );

  return (
    <div className="psa-avatar-img-stack">
      <img
        className="psa-avatar-img psa-avatar-img-layer"
        src={front.src}
        alt=""
        onError={handleImgError}
      />
      {back ? (
        <img
          className={`psa-avatar-img psa-avatar-img-layer psa-avatar-img-layer-incoming${
            backVisible ? ' is-visible' : ''
          }`}
          src={back.src}
          alt=""
          onError={handleImgError}
        />
      ) : null}
    </div>
  );
}
