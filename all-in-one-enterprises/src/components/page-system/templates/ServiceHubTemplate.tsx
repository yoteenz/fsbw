import type { ReactNode } from 'react';
import { AioPageShell } from '../AioPageShell';
import { AioCinematicHero } from '../AioCinematicHero';
import { AioSectionHeading } from '../AioSectionHeading';
import { AioServiceRowList, type ServiceRowItem } from '../AioServiceRowList';
import { AioRoadmapFooterCta } from '../AioRoadmapFooterCta';

type Breadcrumb = { label: string; href?: string };

type Props = {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  breadcrumbs?: Breadcrumb[];
  heroActions?: ReactNode;
  services: ServiceRowItem[];
  directoryEyebrow?: string;
  directoryTitle?: string;
  showRoadmapFooter?: boolean;
  roadmapFooterTitle?: string;
  roadmapFooterDescription?: string;
  compactHero?: boolean;
  backgroundImage?: string;
  children?: ReactNode;
};

export function ServiceHubTemplate({
  eyebrow,
  title,
  description,
  breadcrumbs,
  heroActions,
  services,
  directoryEyebrow = 'Service Directory',
  directoryTitle = 'Explore services',
  showRoadmapFooter = true,
  roadmapFooterTitle,
  roadmapFooterDescription,
  compactHero = true,
  backgroundImage,
  children,
}: Props) {
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
          <AioSectionHeading eyebrow={directoryEyebrow} title={directoryTitle} light />
          <AioServiceRowList services={services} />
          {children}
        </div>
      </div>
      {showRoadmapFooter ? (
        <AioRoadmapFooterCta title={roadmapFooterTitle} description={roadmapFooterDescription} />
      ) : null}
    </AioPageShell>
  );
}
