type NotificationIconKind = 'reward' | 'order' | 'lounge' | 'appointment' | 'analysis';

function NotificationIcon({ kind }: { kind: NotificationIconKind }) {
  return (
    <span className="dn-slot__icon" aria-hidden>
      {kind === 'reward' ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M12 2l2.4 4.8L20 8l-3.6 3.5.9 5.2L12 14.8 6.7 16.7l.9-5.2L4 8l5.6-1.2L12 2z" />
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
          <rect x="2" y="5" width="20" height="14" rx="2" />
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
          <path d="M4 19h16M7 16V9M12 16V5M17 16v-4" />
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
};

export function DesktopNotificationsRecentSlot({ title, body, meta, icon = 'reward' }: Props) {
  return (
    <article className="dn-slot dn-slot--recent">
      <div className="dn-slot__accent" aria-hidden />
      <NotificationIcon kind={icon} />
      <div className="dn-slot__copy">
        <h3 className="dn-slot__title">{title}</h3>
        <p className="dn-slot__body">{body}</p>
        <p className="dn-slot__meta">{meta}</p>
      </div>
    </article>
  );
}
