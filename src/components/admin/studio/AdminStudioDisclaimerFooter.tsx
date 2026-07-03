import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type AdminStudioDisclaimerFooterProps = {
  children?: string;
};

export function AdminStudioDisclaimerFooter({
  children = 'DEMO CONTENT · EDITS SAVED LOCALLY · NO PUBLISHING',
}: AdminStudioDisclaimerFooterProps) {
  return (
    <p
      className="mt-4 text-[7px] font-futura uppercase text-center"
      style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}
    >
      {children}
    </p>
  );
}
