type AdminStudioRankedListProps = {
  title: string;
  items: Array<{ title: string; metric: string; format?: string }>;
  accentHex?: string;
};

/** Ranked list for top episodes / popular content. */
export function AdminStudioRankedList({ title, items, accentHex = '#EB1C24' }: AdminStudioRankedListProps) {
  return (
    <div
      className="p-3"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <p
        className="text-[8px] font-futura uppercase mb-2 tracking-wider"
        style={{ fontWeight: 515, color: accentHex }}
      >
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className="flex items-start gap-2">
            <span
              className="flex-shrink-0 w-4 text-[7px] font-futura"
              style={{ fontWeight: 515, color: '#9A9A9A' }}
            >
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <p
                className="text-[8px] truncate"
                style={{
                  fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
                  color: '#FFFFFF',
                }}
              >
                {item.title}
              </p>
              <p
                className="text-[6px] font-futura uppercase"
                style={{ fontWeight: 515, color: '#9A9A9A' }}
              >
                {item.format ? `${item.format} · ` : ''}
                {item.metric}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
