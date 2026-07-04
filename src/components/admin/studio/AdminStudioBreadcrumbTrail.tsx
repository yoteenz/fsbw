import { useNavigate } from 'react-router-dom';
import type { StudioBreadcrumbSegment } from '../../../utils/adminStudioNavigation';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioBreadcrumbTrailProps = {
  segments: StudioBreadcrumbSegment[];
};

/** In-card breadcrumb: Admin / StudioOS / Group / Module */
export function AdminStudioBreadcrumbTrail({ segments }: AdminStudioBreadcrumbTrailProps) {
  const navigate = useNavigate();

  if (segments.length === 0) return null;

  return (
    <nav
      aria-label="Studio breadcrumb"
      className="flex flex-wrap items-center gap-1 mb-3 text-[7px] font-futura uppercase"
      style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
    >
      {segments.map((seg, index) => {
        const isLast = index === segments.length - 1;
        const key = `${seg.label}-${index}`;

        return (
          <span key={key} className="inline-flex items-center gap-1">
            {index > 0 ? (
              <span aria-hidden="true" style={{ color: ADMIN_STUDIO_THEME.textSecondary }}>
                /
              </span>
            ) : null}
            {seg.path && !isLast ? (
              <button
                type="button"
                onClick={() => navigate(seg.path!)}
                className="hover:underline"
                style={{ color: ADMIN_STUDIO_THEME.textSecondary }}
              >
                {seg.label}
              </button>
            ) : (
              <span style={{ color: isLast ? ADMIN_STUDIO_THEME.textPrimary : ADMIN_STUDIO_THEME.textSecondary }}>
                {seg.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
