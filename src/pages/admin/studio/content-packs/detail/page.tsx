import { useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioTabBar } from '../../../../../components/admin/studio/AdminStudioTabBar';
import { useAdminStudioContentPack } from '../../../../../hooks/useAdminStudioEditableState';
import {
  ADMIN_STUDIO_CONTENT_PACK_TAB_LABELS,
  ADMIN_STUDIO_CONTENT_PACK_TAB_ORDER,
  type AdminStudioContentPackTabId,
} from '../../../../../utils/adminStudioContentPacksDemo';

export default function AdminStudioContentPackDetailPage() {
  const { packId } = useParams<{ packId: string }>();
  const navigate = useNavigate();
  const { pack, updateTabField, updatePackMeta } = useAdminStudioContentPack(packId);
  const [activeTab, setActiveTab] = useState<AdminStudioContentPackTabId>('episode');

  if (!packId || !pack) {
    return <Navigate to="/admin/studio/content-packs" replace />;
  }

  const tabs = ADMIN_STUDIO_CONTENT_PACK_TAB_ORDER.map((id) => ({
    id,
    label: ADMIN_STUDIO_CONTENT_PACK_TAB_LABELS[id],
  }));

  const activeFields = pack.tabs[activeTab] ?? [];

  return (
    <AdminStudioStageShell
      title={pack.title}
      subtitle={pack.subtitle}
      breadcrumbParentLabel="CONTENT PACKS"
      breadcrumbParentPath="/admin/studio/content-packs"
      onBack={() => navigate('/admin/studio/content-packs')}
      accentHex={pack.accentHex}
    >
      <div className="flex gap-3 mb-5">
        <div
          className="relative flex-shrink-0 overflow-hidden"
          style={{ width: '72px', height: '72px', border: `1px solid ${pack.accentHex}55` }}
        >
          <img src={pack.thumbnailSrc} alt="" className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <AdminStudioEditableField
            label="PACK TITLE"
            value={pack.title}
            onChange={(value) => updatePackMeta('title', value)}
            accentHex={pack.accentHex}
          />
          <AdminStudioEditableField
            label="SUBTITLE"
            value={pack.subtitle}
            onChange={(value) => updatePackMeta('subtitle', value)}
            accentHex={pack.accentHex}
          />
          <AdminStudioEditableField
            label="STATUS"
            value={pack.status}
            onChange={(value) => updatePackMeta('status', value)}
            accentHex={pack.accentHex}
          />
        </div>
      </div>

      <AdminStudioTabBar
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        accentHex={pack.accentHex}
      />

      <div className="mt-4 space-y-2">
        {activeFields.length === 0 ? (
          <p
            className="text-[8px] font-futura uppercase py-6 text-center"
            style={{ fontWeight: 515, color: '#9A9A9A' }}
          >
            NO FIELDS IN THIS TAB — ADD DEMO CONTENT IN SEED
          </p>
        ) : (
          activeFields.map((field) => (
            <AdminStudioEditableField
              key={field.key}
              label={field.label}
              value={field.value}
              onChange={(value) => updateTabField(activeTab, field.key, value)}
              multiline={field.multiline}
              accentHex={pack.accentHex}
            />
          ))
        )}
      </div>

      <p
        className="mt-6 text-[7px] font-futura uppercase text-center"
        style={{ fontWeight: 515, color: '#9A9A9A' }}
      >
        DEMO CONTENT · EDITS SAVED LOCALLY · NO PUBLISHING
      </p>
    </AdminStudioStageShell>
  );
}
