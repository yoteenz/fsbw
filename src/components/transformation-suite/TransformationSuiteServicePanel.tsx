type Props = {
  title: string;
  subtitle?: string;
  bullets?: string[];
  onBook?: () => void;
};

export function TransformationSuiteServicePanel({ title, subtitle, bullets, onBook }: Props) {
  return (
    <article className="ts-panel ts-panel--service acrylic-glass-surface">
      <div className="acrylic-glass-surface__rose-base" aria-hidden />
      <h2 className="ts-panel__title">{title}</h2>
      {subtitle ? <p className="ts-panel__subtitle">{subtitle}</p> : null}
      {bullets ? (
        <ul className="ts-panel__list">
          {bullets.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ) : null}
      <button type="button" className="ts-panel__cta" onClick={onBook}>
        Book Now
      </button>
    </article>
  );
}
