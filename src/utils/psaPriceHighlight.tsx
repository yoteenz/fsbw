import type { ReactNode } from 'react';

const PSA_PRICE_TOKEN_RE = /(\$[\d,]+(?:\.\d{2})?)/g;
const PSA_PRICE_VALUE_RE = /^\$[\d,]+(?:\.\d{2})?$/;

/** Wrap USD price tokens in assistant bubble copy with brand red styling. */
export function renderPsaPriceHighlightedText(text: string): ReactNode {
  if (!text.includes('$')) return text;

  const parts = text.split(PSA_PRICE_TOKEN_RE);
  return parts.map((part, index) =>
    PSA_PRICE_VALUE_RE.test(part) ? (
      <span key={`psa-price-${index}`} className="psa-chat-price">
        {part}
      </span>
    ) : (
      part
    )
  );
}
