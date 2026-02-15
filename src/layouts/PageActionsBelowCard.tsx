import React from 'react';

/**
 * Wraps page action buttons that belong BELOW the main card (not inside it).
 * See src/layouts/PAGE_LAYOUT.md.
 *
 * Usage:
 *   <div>Main card content only</div>
 *   {!showMobileMenu && (
 *     <PageActionsBelowCard>
 *       <button ...>VIEW LISTS</button>
 *       <PageActionsBelowCard.Spacer />
 *       <button ...>EMPTY WISHLIST</button>
 *     </PageActionsBelowCard>
 *   )}
 */
const PAGE_ACTION_FIRST_SPACING = { marginTop: '2px' } as const;
const PAGE_ACTION_NEXT_SPACING = { marginTop: '10px' } as const;

export function PageActionsBelowCard({
  children,
  className = '',
  style = {}
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={`px-0 md:px-0 ${className}`.trim()}
      style={{ ...PAGE_ACTION_FIRST_SPACING, ...style }}
    >
      {children}
    </div>
  );
}

/** Use between multiple buttons under the card so the second+ get 10px top spacing. */
function Spacer() {
  return <div style={PAGE_ACTION_NEXT_SPACING} />;
}

PageActionsBelowCard.Spacer = Spacer;

/** Shared button style for page actions (red, bordered, Futura, uppercase). */
export const pageActionButtonStyle: React.CSSProperties = {
  borderWidth: '1.3px',
  color: '#EB1C24',
  fontFamily: '"Futura PT Medium"',
  backgroundColor: '#FFFFFF',
  fontSize: '11px',
  textTransform: 'uppercase'
};
