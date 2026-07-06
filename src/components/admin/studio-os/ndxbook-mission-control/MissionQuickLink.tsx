import type { CSSProperties, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

type MissionQuickLinkProps = {
  to: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
};

/** Reliable mobile quick link — native href fallback + explicit SPA navigation + scroll reset. */
export function MissionQuickLink({ to, children, className, style }: MissionQuickLinkProps) {
  const navigate = useNavigate();

  return (
    <a
      href={to}
      className={className}
      style={style}
      onClick={(event) => {
        event.preventDefault();
        navigate(to);
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }}
    >
      {children}
    </a>
  );
}
