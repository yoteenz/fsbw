import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { useAdminStudioShow } from '../../../../../hooks/useAdminStudioEditableState';
import {
  ADMIN_STUDIO_SHOW_FIELD_GROUPS,
  ADMIN_STUDIO_SHOW_FIELD_LABELS,
} from '../../../../../utils/adminStudioShowsDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

export default function AdminStudioShowDetailPage() {
  const { showId } = useParams<{ showId: string }>();
  const navigate = useNavigate();
  const { show, updateField } = useAdminStudioShow(showId);

  if (!showId || !show) {
    return <Navigate to="/admin/studio/shows" replace />;
  }

  return (
    <AdminStudioStageShell
      title={show.name}
      subtitle={show.publishingFrequency}
      breadcrumbParentLabel="SHOWS"
      breadcrumbParentPath="/admin/studio/shows"
      onBack={() => navigate('/admin/studio/shows')}
      accentHex={show.accentHex}
    >
      <div
        className="relative overflow-hidden mb-5"
        style={{ aspectRatio: '16 / 9', border: `1px solid ${show.accentHex}44` }}
      >
        <img
          src={show.thumbnailSrc}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(180deg, transparent 40%, rgba(255,255,255,0.85) 85%, #FFFFFF 100%)`,
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p
            className="text-[8px] font-futura uppercase mb-1"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
          >
            HOST · {show.host}
          </p>
          <p
            className="text-[7px] font-futura uppercase italic"
            style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textPrimary, lineHeight: 1.45 }}
          >
            &ldquo;{show.openingLine}&rdquo;
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {ADMIN_STUDIO_SHOW_FIELD_GROUPS.map((group) => (
          <section key={group.title}>
            <p
              className="text-[8px] font-futura uppercase mb-3 tracking-widest"
              style={{ fontWeight: 515, color: show.accentHex }}
            >
              {group.title}
            </p>
            <div className="space-y-2">
              {group.keys.map((key) => (
                <AdminStudioEditableField
                  key={key}
                  label={ADMIN_STUDIO_SHOW_FIELD_LABELS[key]}
                  value={show[key]}
                  onChange={(value) => updateField(key, value)}
                  multiline={key === 'description' || key === 'promptTemplate'}
                  accentHex={show.accentHex}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <AdminStudioDisclaimerFooter />
    </AdminStudioStageShell>
  );
}
