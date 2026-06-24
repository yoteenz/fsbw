import type { ReactNode } from 'react';

type GlassSectionProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function GlassSection({ title, children, className = '' }: GlassSectionProps) {
  return (
    <section className={`flex flex-col gap-3 ${className}`}>
      {title ? (
        <h3 className="mansion-subtitle px-1">{title}</h3>
      ) : null}
      {children}
    </section>
  );
}
