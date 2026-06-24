type AlertIconKind = 'action' | 'stock' | 'reward' | 'video' | 'maintenance';

type Priority = 'High' | 'Medium' | 'Low';

function AlertIcon({ kind }: { kind: AlertIconKind }) {
  return (
    <span className="dn-slot__icon" aria-hidden>
      {kind === 'action' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v5M12 16h.01" />
        </svg>
      ) : null}
      {kind === 'stock' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3 7h18M6 7V5h12v2M5 7l1 12h12l1-12" />
        </svg>
      ) : null}
      {kind === 'reward' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M12 3v18M5 8h14M7 8c0-2 2-3 5-3s5 1 5 3" />
        </svg>
      ) : null}
      {kind === 'video' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3" y="6" width="13" height="12" rx="1" />
          <path d="M16 10l5-3v10l-5-3" />
        </svg>
      ) : null}
      {kind === 'maintenance' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L4 17l3 3 5.3-5.3a4 4 0 0 0 5.4-5.4l-2.2 2.2-3.1-3.1 2.2-2.2z" />
        </svg>
      ) : null}
    </span>
  );
}

type Props = {
  title: string;
  body: string;
  subline?: string;
  priority: Priority;
  icon?: AlertIconKind;
};

export function DesktopNotificationsAlertSlot({ title, body, subline, priority, icon = 'action' }: Props) {
  return (
    <article className="dn-slot dn-slot--alert">
      <div className="dn-slot__accent" aria-hidden />
      <AlertIcon kind={icon} />
      <div className="dn-slot__copy">
        <h3 className="dn-slot__title">{title}</h3>
        <p className="dn-slot__body">{body}</p>
        {subline ? <p className="dn-slot__body dn-slot__body--sub">{subline}</p> : null}
        <p className={`dn-slot__priority dn-slot__priority--${priority.toLowerCase()}`}>{priority}</p>
      </div>
    </article>
  );
}
