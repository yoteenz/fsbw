import type { CSSProperties, MouseEventHandler } from 'react';

const CLOSE_ICON_SRC = '/assets/close-icon.svg';

type BrandRedCloseIconProps = {
  size?: number | string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLImageElement>;
  role?: string;
};

/** Native `#EB1C24` close × — do not apply CSS color filters. */
export default function BrandRedCloseIcon({
  size = 16,
  alt = '',
  className,
  style,
  onClick,
  role,
}: BrandRedCloseIconProps) {
  const dimension = typeof size === 'number' ? `${size}px` : size;
  return (
    <img
      src={CLOSE_ICON_SRC}
      alt={alt}
      role={role}
      className={className}
      draggable={false}
      onClick={onClick}
      style={{
        width: dimension,
        height: dimension,
        display: 'block',
        objectFit: 'contain',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}
