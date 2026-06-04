import type { CSSProperties, ReactNode } from 'react';

export type MarblePageShellProps = {
  children: ReactNode;
  /**
   * One viewport tall, no document scroll — marble fills the shell; main card scrolls inside.
   */
  viewportLocked?: boolean;
  className?: string;
  style?: CSSProperties;
};

/** Marble page wrapper. PSA is fixed/portaled and does not expand document height. */
export function MarblePageShell({
  children,
  viewportLocked = false,
  className,
  style,
}: MarblePageShellProps) {
  return (
    <div
      className={className}
      style={{
        position: 'relative',
        ...(viewportLocked
          ? {
              height: '100dvh',
              maxHeight: '100dvh',
              overflow: 'hidden',
            }
          : {}),
        ...style,
      }}
    >
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          backgroundImage: `url('/assets/marble-half.png')`,
          backgroundSize: 'contain',
          backgroundPosition: 'center top',
          backgroundRepeat: 'repeat',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          ...(viewportLocked
            ? {
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
              }
            : {}),
        }}
      >
        {children}
      </div>
    </div>
  );
}
