import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  COMPLIANCE_DISCLAIMER,
  SERVICE_DISCOVERY_CATEGORIES,
  getCatalogServicesByCategory,
  searchCatalogServices,
} from '../services/catalog';
import { aioPaths } from '../utils/paths';
import { AIOCard } from '../components/AIOCard';

const FILTER_OPTIONS = [
  { id: 'all', label: 'All' },
  ...SERVICE_DISCOVERY_CATEGORIES.map((c) => ({ id: c.id, label: c.title })),
];

export function ServicesPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');

  const results = useMemo(() => searchCatalogServices(query, filter), [query, filter]);

  return (
    <>
      <div className="aio-page-hero">
        <div className="aio-container">
          <p className="aio-page-hero__breadcrumb">Services Hub</p>
          <h1 className="aio-page-hero__title">Everything your trucking business needs.</h1>
          <p className="aio-page-hero__desc" style={{ maxWidth: '42rem' }}>
            One place to handle business setup, compliance, safety, operations, freight, and financial management — organized
            by what you need, not an overwhelming list.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '1.5rem' }}>
            <Link to={aioPaths.servicesFind} className="aio-btn aio-btn--gold">
              Find a Service
            </Link>
            <Link to={aioPaths.roadReadyPublic} className="aio-btn aio-btn--outline">
              Road Ready™
            </Link>
          </div>
        </div>
      </div>

      <div className="aio-page-content">
        <div className="aio-container">
          <section className="aio-marketplace-section">
            <h2 className="aio-display-md" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Browse by Category
            </h2>
            <div className="aio-intent-grid">
              {SERVICE_DISCOVERY_CATEGORIES.map((cat) => (
                <AIOCard key={cat.id}>
                  <h3 className="aio-intent-card__title">{cat.title.toUpperCase()}</h3>
                  <p className="aio-intent-card__desc">{cat.description}</p>
                  <Link to={`${aioPaths.services}?category=${cat.id}`} className="aio-intent-card__cta">
                    Explore →
                  </Link>
                </AIOCard>
              ))}
            </div>
          </section>

          <section className="aio-marketplace-section">
            <h2 className="aio-display-md" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>
              Find a Service
            </h2>
            <div className="aio-cc-filters" style={{ marginBottom: '1rem' }}>
              <input
                type="search"
                className="aio-input"
                placeholder="Search services…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search services"
                style={{ maxWidth: '20rem', marginRight: '0.75rem' }}
              />
              {FILTER_OPTIONS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  className={`aio-btn aio-btn--sm ${filter === f.id ? 'aio-btn--gold' : 'aio-btn--outline'}`}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="aio-marketplace-grid">
              {results.slice(0, 24).map((service) => (
                <Link key={service.slug} to={aioPaths.serviceSlug(service.slug)} className="aio-marketplace-card">
                  <h3 className="aio-marketplace-card__title">{service.name}</h3>
                  <p className="aio-marketplace-card__desc">{service.shortDescription}</p>
                  <span className="aio-marketplace-card__cta">{service.cta} →</span>
                </Link>
              ))}
            </div>
            {results.length === 0 && <p>No services match your search.</p>}
          </section>

          {SERVICE_DISCOVERY_CATEGORIES.map((cat) => {
            const services = getCatalogServicesByCategory(cat.id).slice(0, 6);
            if (services.length === 0) return null;
            return (
              <section key={cat.id} id={cat.id} className="aio-marketplace-section">
                <div className="aio-marketplace-section__header">
                  <h2 className="aio-display-md" style={{ fontSize: '1.25rem' }}>
                    {cat.title}
                  </h2>
                  <Link to={aioPaths.servicesFind} className="aio-intent-card__cta">
                    Find services →
                  </Link>
                </div>
                <p style={{ marginBottom: '1rem', color: 'var(--aio-muted, #666)' }}>{cat.headline}</p>
                <div className="aio-marketplace-grid">
                  {services.map((service) => (
                    <Link key={service.slug} to={aioPaths.serviceSlug(service.slug)} className="aio-marketplace-card">
                      <h3 className="aio-marketplace-card__title">{service.name}</h3>
                      <p className="aio-marketplace-card__desc">{service.shortDescription}</p>
                      <span className="aio-marketplace-card__cta">{service.cta} →</span>
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}

          <p className="aio-legal-note" style={{ marginTop: '2rem', fontSize: '0.85rem', opacity: 0.85 }}>
            {COMPLIANCE_DISCLAIMER}
          </p>
        </div>
      </div>
    </>
  );
}
