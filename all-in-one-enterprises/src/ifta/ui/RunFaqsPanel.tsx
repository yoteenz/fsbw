/** Interaction 09 — RUN FAQS (identity locked; partial behavior bound). */
export function RunFaqsPanel({ compact = false }: { compact?: boolean }) {
  const faqs = [
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

  if (compact) {
    return (
      <details className="ifta-run-faqs">
        <summary>09 · RUN FAQS</summary>
        <ul>
          {faqs.map((f) => (
            <li key={f.q}>
              <strong>{f.q}</strong> — {f.a}
            </li>
          ))}
        </ul>
      </details>
    );
  }

  return (
    <section id="run-faqs" className="ifta-section" aria-labelledby="ifta-run-faqs-heading">
      <h2 id="ifta-run-faqs-heading">09 · RUN FAQS</h2>
      <dl>
        {faqs.map((f) => (
          <div key={f.q} style={{ marginBottom: '1rem' }}>
            <dt style={{ fontWeight: 600 }}>{f.q}</dt>
            <dd style={{ margin: '0.25rem 0 0', opacity: 0.88 }}>{f.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
