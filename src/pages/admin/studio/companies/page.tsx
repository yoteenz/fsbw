import { Link } from 'react-router-dom';
import { listLiveCompanies, studioCompanyGrandAtriumPath } from '../../../../studio-os-core/company-routes';

export default function StudioCompaniesIndexPage() {
  const companies = listLiveCompanies();

  return (
    <div style={{ padding: 24, color: '#e8e0d4', fontFamily: '"Futura PT", sans-serif', textTransform: 'uppercase' }}>
      <p style={{ fontSize: 6, letterSpacing: '0.14em', opacity: 0.55 }}>STUDIO WORLD™</p>
      <h1 style={{ fontSize: 10, letterSpacing: '0.1em', margin: '8px 0 16px' }}>Companies™</h1>
      <p style={{ fontSize: 7, opacity: 0.65, maxWidth: 360, lineHeight: 1.5, marginBottom: 20 }}>
        Every company owns Headquarters™, Departments™, Genome™, and Atlas position. Frontal Slayer is the first live instance — not the only one.
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {companies.map((c) => (
          <li key={c.companySlug}>
            <Link
              to={studioCompanyGrandAtriumPath(c.companySlug)}
              style={{ color: '#c9e8ff', fontSize: 8, letterSpacing: '0.08em', textDecoration: 'none' }}
            >
              {c.companyName} · {c.headquartersLabel} →
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
