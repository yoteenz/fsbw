import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../components/pages/Site00PagePrimitives';
import { Link } from 'react-router-dom';
import { SITE00_ROUTES } from '../config/routes';

const PRINCIPLES = [
  { title: 'BUILT FOR BUILDERS', description: 'Tools and infrastructure designed for creators who ship.' },
  { title: 'PRIVACY FIRST', description: 'Your data and projects remain under your control.' },
  { title: 'DESIGNED TO SCALE', description: 'From first launch to enterprise-grade systems.' },
];

export default function AboutPage() {
  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--about">
        <PageIntro
          title={<BracketHeading>ABOUT</BracketHeading>}
          subtitle="THE MISSION, TECHNOLOGY, AND PRINCIPLES BEHIND SITE 00."
        />
        <section className="site00-about-mission">
          <div>
            <p className="site00-label-red">OUR MISSION</p>
            <p className="site00-body">
              SITE 00 is a spatial operating environment for designing, building, and launching digital places —
              identity, infrastructure, and experience in one connected system.
            </p>
            <Link to={SITE00_ROUTES.journal} className="site00-link-red">
              LEARN MORE →
            </Link>
          </div>
          <div className="site00-about-mission__visual" aria-hidden="true" />
        </section>
        <div className="site00-principles-grid">
          {PRINCIPLES.map((p) => (
            <article key={p.title} className="site00-principle-card">
              <h2 className="site00-principle-card__title">{p.title}</h2>
              <p className="site00-principle-card__desc">{p.description}</p>
            </article>
          ))}
        </div>
        <footer className="site00-about-meta">
          <div>
            <p className="site00-label">SITE 00</p>
            <p className="site00-micro">EST. 2024</p>
          </div>
          <div>
            <p className="site00-label">HEADQUARTERS</p>
            <p className="site00-micro">REMOTE / GLOBAL</p>
          </div>
          <div>
            <p className="site00-label">CONTACT</p>
            <a href="mailto:hello@site00.com" className="site00-link-red">
              hello@site00.com
            </a>
          </div>
        </footer>
      </div>
    </Site00PublicShell>
  );
}
