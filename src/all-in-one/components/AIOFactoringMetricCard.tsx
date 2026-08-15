type Props = {
  label: string;
  value: string;
  hint?: string;
};

export function AIOFactoringMetricCard({ label, value, hint }: Props) {
  return (
    <div className="aio-factoring-metric">
      <div className="aio-factoring-metric__value">{value}</div>
      <div className="aio-factoring-metric__label">{label}</div>
      {hint ? <div className="aio-factoring-metric__hint">{hint}</div> : null}
    </div>
  );
}
