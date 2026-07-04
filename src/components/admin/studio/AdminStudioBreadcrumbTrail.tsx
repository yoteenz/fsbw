import { useNavigate } from 'react-router-dom';
import type { StudioBreadcrumbSegment } from '../../../utils/adminStudioNavigation';

type AdminStudioBreadcrumbTrailProps = {
  segments: StudioBreadcrumbSegment[];
};

/** Minimal in-card path — Futura 10px, matches admin hub secondary labels. */
export function AdminStudioBreadcrumbTrail({ segments }: AdminStudioBreadcrumbTrailProps) {
  const navigate = useNavigate();

  if (segments.length <= 2) return null;

  return (
    <p
      className="mb-2"
      style={{
        fontFamily: '"Futura PT Book"',
        fontSize: '10px',
        color: '#808080',
        lineHeight: 1.45,
        margin: 0,
      }}
    >
      {segments.map((seg, index) => {
        const isLast = index === segments.length - 1;
        return (
          <span key={`${seg.label}-${index}`}>
            {index > 0 ? ' / ' : null}
            {seg.path && !isLast ? (
              <button
                type="button"
                onClick={() => navigate(seg.path!)}
                className="hover:underline"
                style={{
                  fontFamily: '"Futura PT Book"',
                  fontSize: '10px',
                  color: '#808080',
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                }}
              >
                {seg.label}
              </button>
            ) : (
              <span style={{ color: isLast ? '#000000' : '#808080' }}>{seg.label}</span>
            )}
          </span>
        );
      })}
    </p>
  );
}
