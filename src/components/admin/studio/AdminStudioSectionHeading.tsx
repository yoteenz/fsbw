type AdminStudioSectionHeadingProps = {
  children: string;
  accentHex?: string;
};

/** Handwritten section title — consistent across Studio modules. */
export function AdminStudioSectionHeading({ children, accentHex = '#EB1C24' }: AdminStudioSectionHeadingProps) {
  return (
    <p
      className="text-lg mb-3"
      style={{
        fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
        color: accentHex,
      }}
    >
      {children}
    </p>
  );
}
