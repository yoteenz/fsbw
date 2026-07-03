import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioShowCard } from '../../../../components/admin/studio/AdminStudioShowCard';
import { AdminStudioSectionHeading } from '../../../../components/admin/studio/AdminStudioSectionHeading';
import { listAdminStudioShows } from '../../../../hooks/useAdminStudioEditableState';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

export default function AdminStudioShowsPage() {
  const navigate = useNavigate();
  const shows = listAdminStudioShows();

  return (
    <AdminStudioStageShell
      title="SHOWS"
      subtitle="RECURRING FRONTAL SLAYER PROGRAMS — YOUR STREAMING LINEUP"
      breadcrumbParentLabel="THE STUDIO"
      breadcrumbParentPath="/admin/studio"
      onBack={() => navigate('/admin/studio')}
    >
      <AdminStudioSectionHeading>PROGRAM GUIDE</AdminStudioSectionHeading>
      <p
        className="text-[8px] font-futura uppercase mb-5 -mt-2"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        {shows.length} RECURRING SHOWS · TAP TO OPEN PRODUCTION DECK
      </p>

      <div className="grid grid-cols-2 gap-3">
        {shows.map((show) => (
          <AdminStudioShowCard
            key={show.id}
            show={show}
            onClick={() => navigate(`/admin/studio/shows/${show.id}`)}
          />
        ))}
      </div>
    </AdminStudioStageShell>
  );
}
