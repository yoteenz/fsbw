import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { fdsGlassClass } from '../glass/tokens';
import { useGlassStyle } from '../hooks/useGlassStyle';
import { cn } from '../utilities/cn';
import type { FdsGlassVariant } from '../tokens/types';

export type GlassSurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: ElementType;
  variant?: FdsGlassVariant;
  hoverable?: boolean;
  children?: ReactNode;
};

export function GlassSurface({
  as: Tag = 'div',
  variant = 'panel',
  hoverable = false,
  className,
  style,
  children,
  ...rest
}: GlassSurfaceProps) {
  const glassStyle = useGlassStyle(variant);

  return (
    <Tag
      className={cn(
        fdsGlassClass(variant),
        `fds-glass--${variant}`,
        hoverable && 'fds-glass--hoverable',
        className,
      )}
      style={{ ...glassStyle, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
