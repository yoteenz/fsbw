import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { AioPageShell } from '../AioPageShell';
import { AioCinematicHero } from '../AioCinematicHero';
import { AioSectionHeading } from '../AioSectionHeading';
import { AioFeatureGrid, type FeatureItem } from '../AioFeatureGrid';
import { AioProcessRail, type ProcessStep } from '../AioProcessRail';
import { AioRoadmapFooterCta } from '../AioRoadmapFooterCta';
import { AIOButton } from '../../AIOButton';

type Breadcrumb = { label: string; href?: string };

type AudienceItem = {
  label: string;
  description?: string;
};

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  primaryCta?: ReactNode;
  secondaryCta?: ReactNode;
  capabilities?: FeatureItem[];
  capabilitiesTitle?: string;
  processSteps?: ProcessStep[];
  processTitle?: string;
  audience?: AudienceItem[];
  audienceTitle?: string;
  children?: ReactNode;
  footerCta?: ReactNode;
  showRoadmapFooter?: boolean;
  compactHero?: boolean;
  backgroundImage?: string;
  importantNote?: ReactNode;
};

export function OperationalServiceTemplate({
  eyebrow,
  title,
  description,
  breadcrumbs,
  primaryCta,
  secondaryCta,
  capabilities,
  capabilitiesTitle = 'What we handle',
  processSteps,
  processTitle = 'How it works',
  audience,
  audienceTitle = "Who it's for",
  children,
  footerCta,
  showRoadmapFooter = false,
  compactHero = false,
  backgroundImage,
  importantNote,
}: Props) {
  const heroActions =
    primaryCta || secondaryCta ? (
      <div className="aio-ps-hero-actions-row">
        {primaryCta}
        {secondaryCta}
      </div>
    ) : undefined;

  return (
    <AioPageShell>
      <AioCinematicHero
        eyebrow={eyebrow}
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={heroActions}
        compact={compactHero}
        backgroundImage={backgroundImage}
      />
      <div className="aio-ps-body">
        <div className="aio-container">
          {importantNote ? <div className="aio-ps-important">{importantNote}</div> : null}

          {capabilities?.length ? (
            <section className="aio-ps-block">
              <AioSectionHeading eyebrow="Capabilities" title={capabilitiesTitle} light />
              <AioFeatureGrid items={capabilities} />
            </section>
          ) : null}

          {processSteps?.length ? (
            <section className="aio-ps-block">
              <AioSectionHeading eyebrow="Process" title={processTitle} light />
              <AioProcessRail steps={processSteps} />
            </section>
          ) : null}

          {audience?.length ? (
            <section className="aio-ps-block">
              <AioSectionHeading eyebrow="Fit" title={audienceTitle} light />
              <ul className="aio-ps-audience">
                {audience.map((item) => (
                  <li key={item.label} className="aio-ps-audience__item">
                    <strong>{item.label}</strong>
                    {item.description ? <span>{item.description}</span> : null}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {children}
        </div>
      </div>
      {footerCta ? (
        <section className="aio-ps-footer-cta">
          <div className="aio-container aio-ps-footer-cta__inner">{footerCta}</div>
        </section>
      ) : null}
      {showRoadmapFooter ? <AioRoadmapFooterCta /> : null}
    </AioPageShell>
  );
}

export function OperationalFooterCta({
  title,
  buttonLabel,
  buttonTo,
}: {
  title: string;
  buttonLabel: string;
  buttonTo: string;
}) {
  return (
    <>
      <h2 className="aio-ps-footer-cta__title">{title}</h2>
      <AIOButton to={buttonTo} variant="gold" showArrow>
        {buttonLabel}
      </AIOButton>
    </>
  );
}

export function OperationalTextLink({ to, children }: { to: string; children: ReactNode }) {
  return (
    <Link to={to} className="aio-ps-text-action">
      {children}
    </Link>
  );
}
