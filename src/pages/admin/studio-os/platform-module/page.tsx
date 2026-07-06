import { StudioPlatformLayout } from '../../../../components/admin/studio-os/StudioPlatformLayout';
import { STUDIO_PLATFORM_NAV, type StudioPlatformNavId } from '../../../../studio-os-core/platform/navigation';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type Props = {
  moduleId: StudioPlatformNavId;
};

/** Architecture-ready placeholder for Studio Administration modules not yet fully extracted from org HQ routes. */
export default function StudioPlatformModulePage({ moduleId }: Props) {
  const nav = STUDIO_PLATFORM_NAV.find((item) => item.id === moduleId);
  const title = nav?.label ?? 'STUDIO ADMINISTRATION';
  const subtitle = nav?.description ?? 'Platform module';

  return (
    <StudioPlatformLayout title={title} subtitle={subtitle}>
      <div className="p-3 border space-y-3" style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder }}>
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '7px', color: '#444', lineHeight: 1.55, margin: 0 }}>
          This module belongs to Studio Administration — the platform layer above every organization. It summarizes portfolio-wide
          activity and never inherits a single company&apos;s Mission Control.
        </p>
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#6366F1', margin: 0 }}>
          ARCHITECTURE-READY · DATA MODEL SEPARATE FROM ORGANIZATION HEADQUARTERS
        </p>
      </div>
    </StudioPlatformLayout>
  );
}
