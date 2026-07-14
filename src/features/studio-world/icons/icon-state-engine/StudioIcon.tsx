import { useMemo, type CSSProperties } from 'react';
import {
  renderIconState,
  detectReducedMotionPreference,
  detectHighContrastPreference,
  type StudioWorldIconProceduralState,
  type StudioWorldIconTheme,
  type IconStateDevice,
} from '../../../../studio-os-core/icon-state-engine';
import { ensureStudioWorldIconSystemBridge } from '../studio-world-icon-system-bridge';
import './studio-icon.css';

export type StudioIconTheme = StudioWorldIconTheme | 'dark' | 'light';

export type StudioIconProps = {
  id: string;
  state?: StudioWorldIconProceduralState;
  theme?: StudioIconTheme;
  size?: number | string;
  device?: IconStateDevice;
  animated?: boolean;
  label?: string;
  decorative?: boolean;
  className?: string;
  onClick?: () => void;
};

function parseSize(size: number | string | undefined): number {
  if (typeof size === 'number') return size;
  if (typeof size === 'string') {
    const n = parseInt(size, 10);
    return Number.isFinite(n) ? n : 24;
  }
  return 24;
}

/**
 * Studio World procedural icon — one certified asset, runtime state interpretation.
 * Never import image files directly; resolves through Icon System + State Engine.
 */
export function StudioIcon({
  id,
  state = 'default',
  theme = 'dark',
  size = 24,
  device = 'desktop',
  animated = true,
  label,
  decorative = false,
  className = '',
  onClick,
}: StudioIconProps) {
  ensureStudioWorldIconSystemBridge();

  const sizePx = parseSize(size);
  const reducedMotion = useMemo(() => detectReducedMotionPreference(), []);
  const highContrast = useMemo(() => detectHighContrastPreference(), []);

  const rendered = useMemo(
    () =>
      renderIconState({
        iconId: id,
        state,
        theme,
        sizePx,
        device,
        animated,
        reducedMotion,
        highContrast,
      }),
    [id, state, theme, sizePx, device, animated, reducedMotion, highContrast]
  );

  if (!rendered) {
    return (
      <span
        className={`swi-icon swi-icon--missing ${className}`.trim()}
        style={{ width: sizePx, height: sizePx }}
        data-swi-missing={id}
        aria-label={decorative ? undefined : label ?? `Missing icon: ${id}`}
        aria-hidden={decorative || undefined}
      />
    );
  }

  const style = rendered.cssVariables as CSSProperties;
  const showLock = rendered.state === 'locked';

  const Wrapper = onClick ? 'button' : 'span';

  return (
    <Wrapper
      type={onClick ? 'button' : undefined}
      className={`${rendered.classNames.join(' ')} ${className}`.trim()}
      style={style}
      onClick={onClick}
      role={rendered.aria.role}
      aria-label={decorative ? undefined : label ?? rendered.aria.label}
      aria-busy={rendered.aria.busy || undefined}
      aria-disabled={rendered.aria.disabled || undefined}
      aria-hidden={decorative ? true : rendered.aria.hidden || undefined}
      {...rendered.dataAttributes}
    >
      {rendered.assetPath ? (
        <img
          src={rendered.assetPath}
          alt=""
          className="swi-icon__img"
          width={sizePx}
          height={sizePx}
          draggable={false}
        />
      ) : (
        <span className="swi-icon__img swi-icon__placeholder" aria-hidden />
      )}
      {showLock ? <span className="swi-icon__lock" aria-hidden /> : null}
    </Wrapper>
  );
}
