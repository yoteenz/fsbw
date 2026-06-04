import { Fragment, type ReactNode } from 'react';
import { renderPsaPriceHighlightedText } from './psaPriceHighlight';

const PSA_BULLET_LINE_RE = /^-\s+(.+)$/;

/** Render assistant bubble copy with brand-red bullets instead of hyphen list markers. */
export function renderPsaAssistantBubbleText(text: string): ReactNode {
  if (!text) return null;

  const lines = text.split('\n');
  const nodes: ReactNode[] = [];
  let key = 0;

  for (let i = 0; i < lines.length; ) {
    const line = lines[i];

    if (line.trim() === '') {
      nodes.push(<br key={`br-${key++}`} />);
      i += 1;
      continue;
    }

    const bulletMatch = line.match(PSA_BULLET_LINE_RE);
    if (bulletMatch) {
      while (i < lines.length) {
        const bulletLine = lines[i];
        const match = bulletLine.match(PSA_BULLET_LINE_RE);
        if (!match) break;
        nodes.push(
          <p key={`bullet-${key++}`} className="psa-chat-bullet">
            <span className="psa-chat-bullet-mark" aria-hidden>
              •
            </span>{' '}
            {renderPsaPriceHighlightedText(match[1])}
          </p>
        );
        i += 1;
      }
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const paragraphLine = lines[i];
      if (paragraphLine.trim() === '' || PSA_BULLET_LINE_RE.test(paragraphLine)) break;
      paragraphLines.push(paragraphLine);
      i += 1;
    }

    nodes.push(
      <span key={`para-${key++}`} className="psa-chat-paragraph">
        {paragraphLines.map((paragraphLine, index) => (
          <Fragment key={index}>
            {index > 0 ? <br /> : null}
            {renderPsaPriceHighlightedText(paragraphLine)}
          </Fragment>
        ))}
      </span>
    );
  }

  return nodes;
}
