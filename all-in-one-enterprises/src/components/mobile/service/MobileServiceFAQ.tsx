import { useState } from 'react';

type FaqItem = { question: string; answer: string };

type Props = {
  items: FaqItem[];
  heading?: string;
};

export function MobileServiceFAQ({ items, heading = 'Questions About This Service?' }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!items.length) return null;

  return (
    <section className="aio-msvc-faq" aria-labelledby="aio-msvc-faq-heading">
      <h2 id="aio-msvc-faq-heading" className="aio-msvc-section-label">
        {heading}
      </h2>
      <ul className="aio-msvc-faq__list">
        {items.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <li key={item.question} className="aio-msvc-faq__item">
              <button
                type="button"
                className="aio-msvc-faq__question"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <span>{item.question}</span>
                <span aria-hidden="true">{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen ? <p className="aio-msvc-faq__answer">{item.answer}</p> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
