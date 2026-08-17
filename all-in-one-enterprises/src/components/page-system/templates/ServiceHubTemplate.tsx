import type { ReactNode } from 'react';
import type { ContextRailConfig } from '../../context-rail/types';
import { AioDesktopContextShell } from '../../context-rail';
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
  contextRail?: ContextRailConfig | null;
  scrollSpy?: boolean;
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
  contextRail,
  scrollSpy,
}: Props) {
  return (
    <AioPageShell>
      <AioDesktopContextShell config={contextRail} scrollSpy={scrollSpy}>
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
      </AioDesktopContextShell>
    </AioPageShell>
  );
}
