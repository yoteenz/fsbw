type Props = {
  label: string;
  onClick?: () => void;
};

export function DesktopNotificationsLinkCta({ label, onClick }: Props) {
  return (
    <button type="button" className="dn-link-cta" onClick={onClick}>
      <span>{label}</span>
      <span className="dn-link-cta__arrow" aria-hidden>
        →
      </span>
    </button>
  );
}
