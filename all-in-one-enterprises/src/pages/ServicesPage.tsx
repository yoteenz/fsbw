import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { COMPLIANCE_DISCLAIMER, SERVICE_DISCOVERY_CATEGORIES, getCatalogServicesByCategory } from '../services/catalog';
import { divisionMeta, getServicesByDivision, type ServiceDivision } from '../data/services';
import { aioPaths } from '../utils/paths';
import { AIOButton } from '../components/AIOButton';
import {
  AioPageShell,
  AioCinematicHero,
  AioSectionHeading,
  AioServiceRowList,
  AioRoadmapFooterCta,
  discoveryCategoryToDivision,
  divisionHubEyebrow,
  type ServiceRowItem,
} from '../components/page-system';

function categoryHubHref(categoryId: string): string {
  const division = discoveryCategoryToDivision[categoryId];
  if (division) return aioPaths.serviceSlug(division);
  if (categoryId === 'get-road-ready') return aioPaths.roadReadyPublic;
  if (categoryId === 'manage-my-money') return aioPaths.bookkeeping;
  return `${aioPaths.services}?category=${categoryId}`;
}

export function buildDivisionServiceRows(division: ServiceDivision): ServiceRowItem[] {
  return getServicesByDivision(division).map((service) => ({
    slug: service.slug,
    title: service.title,
    description: service.shortDescription,
    href: aioPaths.serviceSlug(service.slug),
  }));
}

export function getDivisionHubCopy(division: ServiceDivision) {
  const meta = divisionMeta[division];
  return {
    eyebrow: divisionHubEyebrow[division] ?? meta.title,
    title: meta.headline,
    description: meta.description,
    breadcrumbLabel: meta.title,
  };
}

export function ServicesPage() {
  const featuredRows = useMemo<ServiceRowItem[]>(() => {
    return SERVICE_DISCOVERY_CATEGORIES.flatMap((cat) => {
      const services = getCatalogServicesByCategory(cat.id).slice(0, 3);
      return services.map((service) => ({
        slug: service.slug,
        title: service.name,
        description: service.shortDescription,
        href: aioPaths.serviceSlug(service.slug),
      }));
    }).slice(0, 12);
  }, []);

  const categoryLinks = SERVICE_DISCOVERY_CATEGORIES.map((cat) => ({
    id: cat.id,
    title: cat.title,
    description: cat.headline,
    href: categoryHubHref(cat.id),
  }));

  return (
    <AioPageShell>
      <AioCinematicHero
        eyebrow="Services Hub"
        title={
          <>
            Everything your
            <br />
            business needs.
          </>
        }
        description="One connected platform for formation, compliance, operations, freight, and financial management — organized by what you need next."
        actions={
          <>
            <AIOButton to={aioPaths.servicesFind} variant="gold" showArrow>
              Find a Service
            </AIOButton>
            <AIOButton to={aioPaths.roadReadyPublic} variant="outline-gold" showArrow>
              Road Ready™
            </AIOButton>
          </>
        }
        compact
      />
      <div className="aio-ps-body">
        <div className="aio-container">
          <AioSectionHeading
            eyebrow="Browse"
            title="Choose your pathway"
            subtitle="Start with a category hub, then drill into individual services."
            light
          />
          <div className="aio-ps-hub-categories">
            {categoryLinks.map((cat) => (
              <Link key={cat.id} to={cat.href} className="aio-ps-hub-category">
                <strong>{cat.title}</strong>
                <span>{cat.description}</span>
              </Link>
            ))}
          </div>

          <AioSectionHeading eyebrow="Popular" title="Services carriers request most" light />
          <AioServiceRowList services={featuredRows} />

          <p className="aio-ps-disclaimer" style={{ marginTop: '2rem' }}>
            {COMPLIANCE_DISCLAIMER}
          </p>
        </div>
      </div>
      <AioRoadmapFooterCta
        title="Not sure what you need?"
        description="Road Ready™ builds a personalized checklist for your business stage and operating plans."
      />
    </AioPageShell>
  );
}
