type NotificationIconKind = 'reward' | 'order' | 'lounge' | 'appointment' | 'analysis';

function NotificationIcon({ kind }: { kind: NotificationIconKind }) {
  return (
    <span className="dn-slot__icon" aria-hidden>
      {kind === 'reward' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M6 3h12l1 5-7 4-7-4 1-5zM4 10l8 5 8-5M6 18h12" />
        </svg>
      ) : null}
      {kind === 'order' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <path d="M3 6h18" />
        </svg>
      ) : null}
      {kind === 'lounge' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="12" cy="12" r="9" />
          <path d="M10 9l5 3-5 3V9z" />
        </svg>
      ) : null}
      {kind === 'appointment' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <path d="M16 2v4M8 2v4M3 10h18" />
        </svg>
      ) : null}
      {kind === 'analysis' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M9 3v2M9 19v2M15 3v2M15 19v2M5 9H3M5 15H3M21 9h-2M21 15h-2M7 7h10v10H7z" />
        </svg>
      ) : null}
    </span>
  );
}

type Props = {
  title: string;
  body: string;
  meta: string;
  icon?: NotificationIconKind;
  unread?: boolean;
};

export function DesktopNotificationsRecentSlot({
  title,
  body,
  meta,
  icon = 'reward',
  unread = true,
}: Props) {
  return (
    <article className="dn-slot dn-slot--recent">
      <NotificationIcon kind={icon} />
      <div className="dn-slot__copy">
        <h3 className="dn-slot__title dn-slot__title--accent">{title}</h3>
        <p className="dn-slot__body">{body}</p>
      </div>
      <div className="dn-slot__aside">
        <p className="dn-slot__meta">{meta}</p>
        {unread ? <span className="dn-slot__dot" aria-hidden /> : null}
      </div>
    </article>
  );
}
