import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Site00PublicShell } from '../../components/shell/Site00PublicShell';
import { BracketHeading, PageIntro } from '../../components/pages/Site00PagePrimitives';

/** Client-facing post-payment provisioning (signed-in clients — route guard TBD). */
export default function ProjectProvisioningPage() {
  const { projectSlug = '' } = useParams();
  const [step] = useState(2);

  useEffect(() => {
    document.title = 'SITE 00 — PROVISIONING';
  }, []);

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--provisioning">
        <PageIntro
          title={<BracketHeading>YOUR PROJECT IS OFFICIAL</BracketHeading>}
          subtitle="PAYMENT CONFIRMED. NOW LET'S PREPARE YOUR BUILD ENVIRONMENT."
          body="SITE 00 WILL IDENTIFY ONLY THE SERVICES REQUIRED FOR THIS PROJECT. YOUR INFRASTRUCTURE REMAINS CLIENT-OWNED."
        />

        <ol className="site00-admin-panel" style={{ listStyle: 'none', padding: 16 }}>
          <li style={{ opacity: step >= 1 ? 1 : 0.4 }}>01 PROJECT OFFICIAL</li>
          <li style={{ opacity: step >= 2 ? 1 : 0.4 }}>02 REQUIRED ACCOUNTS</li>
          <li style={{ opacity: step >= 3 ? 1 : 0.4 }}>03 CONNECT ACCESS</li>
          <li style={{ opacity: step >= 4 ? 1 : 0.4 }}>04 READINESS</li>
        </ol>

        <section className="site00-admin-panel">
          <h2 className="site00-label-red">REQUIRED ACCOUNTS — {projectSlug.toUpperCase()}</h2>
          <p className="site00-body">CONNECT ONLY THE SERVICES SITE 00 NEEDS FOR YOUR BUILD PHASE.</p>
          <div className="site00-hub-grid site00-hub-grid--2x2">
            {['VERCEL', 'SUPABASE', 'GITHUB', 'STRIPE'].map((svc) => (
              <article key={svc} className="site00-hub-card">
                <div className="site00-hub-card__copy">
                  <h3 className="site00-hub-card__title">{svc}</h3>
                  <p className="site00-hub-card__desc">CLIENT-OWNED · GRANT ACCESS OR CONNECT EXISTING</p>
                  <span className="site00-hub-card__cta">CONNECT →</span>
                </div>
              </article>
            ))}
          </div>
          <p className="site00-body" style={{ marginTop: 16 }}>
            YOUR PROJECT INFRASTRUCTURE BELONGS TO YOU. SITE 00 RECEIVES ONLY THE ACCESS NECESSARY TO BUILD AND
            MAINTAIN YOUR PROJECT. WE NEVER ASK FOR PLAINTEXT PASSWORDS.
          </p>
        </section>
      </div>
    </Site00PublicShell>
  );
}
