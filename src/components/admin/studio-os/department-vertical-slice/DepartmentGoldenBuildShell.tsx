import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequireAdminPageAccess } from '../../../../hooks/useRequireAdminPageAccess';

type Props = {
  children: ReactNode;
  onExit?: () => void;
  exitLabel?: string;
};

/**
 * Full-screen Golden Build shell — bypasses AdminStudioLayout (marble fixed bg,
 * backdrop-blur card, Studio Orb mount, platform bootstrap) for mobile stability.
 */
export function DepartmentGoldenBuildShell({ children, onExit, exitLabel = 'Exit' }: Props) {
  useRequireAdminPageAccess();
  const navigate = useNavigate();

  return (
    <div className="gb-room-shell" style={{ minHeight: '100dvh', background: '#141210' }}>
      <button
        type="button"
        className="gb-room__exit"
        style={{
          position: 'fixed',
          top: 'max(10px, env(safe-area-inset-top))',
          right: 10,
          zIndex: 20,
          padding: '6px 10px',
          fontSize: 7,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          border: '1px solid rgba(201, 169, 98, 0.55)',
          background: 'rgba(20, 18, 16, 0.92)',
          color: '#f0ebe3',
          cursor: 'pointer',
          fontFamily: '"Futura PT", sans-serif',
        }}
        onClick={onExit ?? (() => navigate('/admin/studio/overview'))}
      >
        {exitLabel}
      </button>
      {children}
    </div>
  );
}
