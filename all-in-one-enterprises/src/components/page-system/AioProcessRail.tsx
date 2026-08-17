export type ProcessStep = {
  number: string;
  title: string;
  description?: string;
};

type Props = {
  steps: ProcessStep[];
  className?: string;
};

export function AioProcessRail({ steps, className = '' }: Props) {
  return (
    <ol className={`aio-ps-process${className ? ` ${className}` : ''}`}>
      {steps.map((step, index) => (
        <li key={`${step.number}-${step.title}`} className="aio-ps-process__step">
          <div className="aio-ps-process__num">{step.number}</div>
          <div className="aio-ps-process__copy">
            <h3 className="aio-ps-process__title">{step.title}</h3>
            {step.description ? <p className="aio-ps-process__desc">{step.description}</p> : null}
          </div>
          {index < steps.length - 1 ? <span className="aio-ps-process__connector" aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}
