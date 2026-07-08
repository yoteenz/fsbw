import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

type Props = {
  children: ReactNode;
};

/**
 * Full-viewport immersive shell — escapes admin document flow.
 * Locks body scroll; department canvas is the entire screen.
 */
export function DepartmentGoldenBuildShell({ children }: Props) {
  useRequireAdminPageAccess();

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    body.classList.add('gb-immersive-active');
    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.classList.remove('gb-immersive-active');
    };
  }, []);

  return (
    <div
      className="gb-immersive-portal"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        width: '100vw',
        height: '100dvh',
        overflow: 'hidden',
        background: '#12100e',
      }}
      role="application"
      aria-label="Studio OS department room"
    >
      {children}
    </div>
  );
}

export function useDepartmentRoomExit() {
  const navigate = useNavigate();
  return () => navigate('/admin/studio/overview');
}
