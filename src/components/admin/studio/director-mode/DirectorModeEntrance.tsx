import type { ReactNode } from 'react';

type DirectorModeEntranceProps = {
  active: boolean;
  children: ReactNode;
};

/** Luxury fade + glass blur entrance — no hard page reload feel. */
export function DirectorModeEntrance({ active, children }: DirectorModeEntranceProps) {
  return (
    <div
      style={{
        opacity: active ? 1 : 0,
        filter: active ? 'blur(0px)' : 'blur(8px)',
        transform: active ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.65s ease, filter 0.65s ease, transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      {children}
    </div>
  );
}
