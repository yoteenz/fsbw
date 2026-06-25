type Props = {
  onViewAnalysis?: () => void;
};

export function DesktopNotificationsFeaturedPanel({ onViewAnalysis }: Props) {
  return (
    <article className="dn-featured acrylic-glass-surface">
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <span className="dn-featured__badge">Featured Notification</span>
      <h2 className="dn-featured__title">Your Hair Analysis Is Ready</h2>
      <p className="dn-featured__body">Your personalized Hair Analysis report is now available.</p>
      <button type="button" className="dn-featured__cta" onClick={onViewAnalysis}>
        View Analysis
      </button>
    </article>
  );
}
