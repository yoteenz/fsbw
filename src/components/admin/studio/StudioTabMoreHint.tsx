import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';

type StudioTabMoreHintProps = {
  children: string;
  accent?: string;
};

/** Lightweight pointer when detailed panels live on other tabs — keeps default tab responsive on mobile. */
export function StudioTabMoreHint({ children, accent = 'rgba(15,23,42,0.04)' }: StudioTabMoreHintProps) {
  return (
    <p
      className="text-[6px] font-futura uppercase p-2 border mb-3"
      style={{
        fontWeight: 515,
        borderColor: ADMIN_STUDIO_THEME.panelBorder,
        color: ADMIN_STUDIO_THEME.textSecondary,
        background: accent,
      }}
    >
      {children}
    </p>
  );
}
