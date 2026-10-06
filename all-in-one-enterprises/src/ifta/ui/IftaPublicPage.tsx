import { Link } from 'react-router-dom';
import { usePageMeta } from '../../hooks/usePageMeta';
import { aioPaths } from '../../utils/paths';
import { aioComplianceIcons } from '../../config/aioIconRegistry';
import { RunFaqsPanel } from './RunFaqsPanel';

const STEPS = [
  { who: 'You', text: 'Your quarter opens' },
  { who: 'You', text: 'Send receipts and miles as you go' },
  { who: 'AIO', text: 'AIO reviews and reconciles' },
  { who: 'You', text: 'You approve the return' },
  { who: 'AIO', text: 'AIO files it' },
  { who: 'AIO', text: 'The filed quarter lands in your Vault' },
];

export function IftaPublicPage() {
  usePageMeta({
    title: 'IFTA Filing — All In One Enterprises',
    description: 'AIO handles the business side of quarterly fuel-tax filing — collect, review, prepare, you approve, AIO files.',
  });

  return (
    <main className="ifta-main">
      <section className="ifta-public-hero">
        <div>
          <p className="ifta-eyebrow">Tax &amp; fuel · IFTA filing</p>
          <h1 className="ifta-h1">AIO handles the business side of quarterly fuel-tax filing.</h1>
          <p className="ifta-lead">
            AIO handles the quarter: you send fuel and miles as they happen, AIO checks, reconciles, files, and keeps the
            record. You approve before anything is filed.
          </p>
          <Link to={aioPaths.getStartedForService('ifta-filing')} className="ifta-cta">
            Request filing
          </Link>
          <p className="ifta-lead" style={{ marginTop: '1rem', fontSize: '0.9rem' }}>
            Need an IFTA account first?{' '}
            <Link to={aioPaths.serviceSlug('ifta-fuel-tax-assistance')} style={{ color: 'var(--ifta-champagne)' }}>
              IFTA account assistance
            </Link>
          </p>
        </div>
        <aside className="ifta-specimen" aria-label="Quarter preview">
          <p className="ifta-specimen__label">This is your quarter in AIO</p>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <img src={aioComplianceIcons.iftaFuelTax} alt="" width={48} height={48} decoding="async" />
            <div>
              <strong>Q3 2026</strong>
              <div style={{ fontSize: '0.85rem', opacity: 0.85 }}>Due Oct 31 · 2 items needed</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--ifta-gold)', marginTop: '0.35rem' }}>Continue filing</div>
            </div>
          </div>
        </aside>
      </section>

      <section className="ifta-section">
        <h2>What IFTA is</h2>
        <p className="ifta-lead">
          IFTA is the quarterly fuel tax report for qualifying interstate carriers. It is due every quarter (Apr 30 · Jul 31 ·
          Oct 31 · Jan 31) and needs fuel receipts and miles by state. AIO builds, checks, and files it with you.
        </p>
      </section>

      <section className="ifta-section">
        <h2>How it works</h2>
        <ol className="ifta-steps">
          {STEPS.map((s) => (
            <li key={s.text} className="ifta-step">
              <span>{s.who}</span>
              {s.text}
            </li>
          ))}
        </ol>
      </section>

      <section className="ifta-section">
        <h2>What AIO handles · What you provide</h2>
        <div className="ifta-ledger">
          <div>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>AIO handles</h3>
            <ul>
              <li>Collecting and checking receipts</li>
              <li>Turning ELD / trip records into miles by state</li>
              <li>Matching fuel to miles and preparing the return</li>
              <li>Filing after your approval and sealing the Vault packet</li>
            </ul>
          </div>
          <div>
            <h3 style={{ fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>You provide</h3>
            <ul>
              <li>Fuel receipts (photo, upload, or from your Vault)</li>
              <li>Miles by state (ELD report, import, or manual)</li>
              <li>Confirmation of which trucks ran</li>
              <li>Approval of the return</li>
            </ul>
          </div>
        </div>
      </section>

      <RunFaqsPanel />

      <section className="ifta-section">
        <h2>How to start</h2>
        <p className="ifta-lead">Request filing support — AIO collects your quarter, reviews, prepares, and files after you approve.</p>
        <Link to={aioPaths.getStartedForService('ifta-filing')} className="ifta-cta">
          Get started · request quote
        </Link>
      </section>
    </main>
  );
}
