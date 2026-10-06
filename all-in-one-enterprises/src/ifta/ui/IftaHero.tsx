import type { ReactNode } from 'react';
import { IFTA_MEDIA } from './iftaAssetManifest';

/**
 * Filing Room hero banner (component stack 01): quarter identity on a STONE WHITE wash over the approved highway /
 * truck photograph. Shared by the client Filing Room and the staff case (same canonical quarter, different actor).
 */
export function IftaFilingRoomHero({
  eyebrow,
  title,
  period,
  lines,
  status,
  aside,
  crumbs,
  compact = false,
}: {
  eyebrow: string;
  title: string;
  period?: string;
  lines?: ReactNode;
  status?: ReactNode;
  aside?: ReactNode;
  crumbs?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className={`ifta-hero${compact ? ' ifta-hero--compact' : ''}`} aria-label={`${eyebrow} ${title}`}>
      <div className="ifta-hero__media" aria-hidden="true">
        <img src={IFTA_MEDIA.filingRoomHero} alt="" fetchPriority="high" decoding="async" />
      </div>
      <div className="ifta-hero__wash" aria-hidden="true" />
      <div className="ifta-hero__inner">
        <div className="ifta-hero__body">
          {crumbs ? <div className="ifta-hero__crumbs">{crumbs}</div> : null}
          <p className="ifta-hero__eyebrow">{eyebrow}</p>
          <h1 className="ifta-hero__title">{title}</h1>
          {period ? <p className="ifta-hero__period">{period}</p> : null}
          <span className="ifta-hero__rule" aria-hidden="true" />
          {lines ? <div className="ifta-hero__lines">{lines}</div> : null}
          {status ? <div className="ifta-hero__status">{status}</div> : null}
        </div>
        {aside ? <div className="ifta-hero__aside">{aside}</div> : null}
      </div>
    </section>
  );
}
