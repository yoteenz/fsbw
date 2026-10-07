import { IftaIcon } from './IftaIcon';

export const IFTA_FAQS = [
  {
    q: 'What is IFTA?',
    a: 'The quarterly fuel tax report for qualifying interstate carriers — miles and fuel purchases by jurisdiction.',
  },
  {
    q: 'Does AIO file automatically?',
    a: 'No. AIO prepares the return; you approve before anything is filed with your base jurisdiction.',
  },
  {
    q: 'What do I send each quarter?',
    a: 'Fuel receipts and miles by state for trucks that operated. AIO reconciles and flags gaps.',
  },
];

/**
 * Interaction 09 — RUN FAQS (identity locked: “09 RUN FAQS”, between 08 MESSAGE TEAM and 10 SUBMIT FOR APPROVAL).
 * Only the answers below are bound; no further behaviour is invented (D-INTERACTION-09). Public mode opens the same
 * answers from RESOURCES / search in the top nav.
 */
export function RunFaqsPanel() {
  return (
    <section className="ifta-card ifta-faqtool" aria-label="09 RUN FAQS">
      <header className="ifta-faqtool__head">
        <span className="ifta-faqtool__badge" aria-hidden="true">
          09
        </span>
        <span className="ifta-faqtool__titles">
          <span className="ifta-faqtool__title">Run FAQs</span>
          <span className="ifta-faqtool__sub">Interaction 09 · client answers at hand</span>
        </span>
        <IftaIcon name="faq" size={22} className="ifta-faqtool__icon" />
      </header>
      <div className="ifta-faqtool__list">
        {IFTA_FAQS.map((f) => (
          <details key={f.q} className="ifta-faq">
            <summary>
              <span>{f.q}</span>
              <IftaIcon name="chevron" size={16} className="ifta-faq__chev" />
            </summary>
            <p>{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
