import { useNavigate } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioShowCard } from '../../../../components/admin/studio/AdminStudioShowCard';
import { listAdminStudioShows } from '../../../../hooks/useAdminStudioEditableState';

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
      <p
        className="text-lg mb-4"
        style={{
          fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
          color: '#EB1C24',
        }}
      >
        PROGRAM GUIDE
      </p>
      <p
        className="text-[8px] font-futura uppercase mb-5"
        style={{ fontWeight: 515, color: '#9A9A9A', lineHeight: 1.5 }}
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
