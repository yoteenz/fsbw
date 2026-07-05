import { useTutorialOs } from '../TutorialOsContext';
import { resolveTutorialPageForPathname } from '../v2/pageRegistry';

type Props = {
  pathname: string;
};

/** Subtle ? control — opens page-relevant tutorial without replaying the full Mansion Tour. */
export function TutorialPageHelpButton({ pathname }: Props) {
  const { isTourActive, showWelcome, openPageHelp } = useTutorialOs();
  if (isTourActive || showWelcome) return null;
  const page = resolveTutorialPageForPathname(pathname);
  if (!page?.helpTourId) return null;

  return (
    <button
      type="button"
      className="tutorial-os-page-help"
      onClick={() => openPageHelp(pathname)}
      aria-label="Learn this page"
      title="Learn this page"
      style={{
        position: 'fixed',
        zIndex: 99950,
        left: '14px',
        bottom: 'max(24px, env(safe-area-inset-bottom))',
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        border: '1.3px solid #0a0a0a',
        background: 'rgba(255,255,255,0.88)',
        backdropFilter: 'blur(10px)',
        fontFamily: '"Futura PT Medium"',
        fontSize: '14px',
        color: '#EB1C24',
        cursor: 'pointer',
        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
      }}
    >
      ?
    </button>
  );
}
