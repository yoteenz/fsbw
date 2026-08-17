import type { ReactNode } from 'react';

type Props = {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function AioActionPanel({ title, children, footer, className = '' }: Props) {
  return (
    <aside className={`aio-ps-action-panel${className ? ` ${className}` : ''}`}>
      <h2 className="aio-ps-action-panel__title">{title}</h2>
      <div className="aio-ps-action-panel__body">{children}</div>
      {footer ? <div className="aio-ps-action-panel__footer">{footer}</div> : null}
    </aside>
  );
}
