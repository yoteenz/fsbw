type AdminStudioDisclaimerFooterProps = {
  children?: string;
};

/** Consistent demo disclaimer footer for Studio stage pages. */
export function AdminStudioDisclaimerFooter({
  children = 'DEMO CONTENT · EDITS SAVED LOCALLY · NO PUBLISHING',
}: AdminStudioDisclaimerFooterProps) {
  return (
    <p
      className="mt-4 text-[7px] font-futura uppercase text-center"
      style={{ fontWeight: 515, color: '#9A9A9A' }}
    >
      {children}
    </p>
  );
}
