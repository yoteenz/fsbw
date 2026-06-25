type Props = {
  title: string;
  bullets: string[];
  onBook?: () => void;
};

export function TransformationSuiteConsultPanel({ title, bullets, onBook }: Props) {
  return (
    <article className="ts-panel ts-panel--consult acrylic-glass-surface">
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <h2 className="ts-panel__title">{title}</h2>
      <ul className="ts-panel__list">
        {bullets.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>
      <button type="button" className="ts-panel__cta" onClick={onBook}>
        Book Now
      </button>
    </article>
  );
}
