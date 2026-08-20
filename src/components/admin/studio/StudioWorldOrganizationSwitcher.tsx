import { useState } from 'react';
import { ADMIN_STUDIO_THEME } from '../../../utils/adminStudioTheme';
import { useStudioWorldOperatorContext } from '../../../hooks/useStudioWorldOperatorContext';

/**
 * Server-authorized Studio World organization switcher (distinct from workspace switcher).
 */
export function StudioWorldOrganizationSwitcher() {
  const { context, organizations, loading, error, switchOrganization } = useStudioWorldOperatorContext();
  const [open, setOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  if (organizations.length < 2) return null;

  const activeSlug = context?.activeOrganizationSlug;

  const handleSwitch = async (slug: string) => {
    if (slug === activeSlug) {
      setOpen(false);
      return;
    }
    setSwitching(true);
    try {
      await switchOrganization(slug);
      setOpen(false);
    } catch {
      /* error surfaced via hook */
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="relative mb-2" data-studio-world-org-switcher>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        disabled={loading || switching}
        className="w-full text-left px-2 py-1.5 rounded-sm border"
        style={{
          borderColor: ADMIN_STUDIO_THEME.panelBorder,
          background: 'rgba(255,255,255,0.9)',
          fontFamily: '"Futura PT Medium"',
          fontSize: '6px',
        }}
      >
        STUDIO WORLD ORG · {context?.activeOrganizationName ?? '—'}
        {switching ? ' · switching…' : ''}
      </button>
      {error ? (
        <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: ADMIN_STUDIO_THEME.accent, margin: '4px 0 0' }}>
          {error}
        </p>
      ) : null}
      {open ? (
        <div
          className="absolute left-0 right-0 z-40 mt-1 p-1 rounded-sm border"
          style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.98)' }}
        >
          {organizations.map((org) => (
            <button
              key={org.slug}
              type="button"
              onClick={() => void handleSwitch(org.slug)}
              className="w-full text-left px-2 py-1 mb-0.5"
              style={{
                fontFamily: '"Futura PT Book"',
                fontSize: '6px',
                border:
                  org.slug === activeSlug ? `1px solid ${ADMIN_STUDIO_THEME.accent}` : '1px solid #eee',
                background: org.slug === activeSlug ? 'rgba(235,28,36,0.04)' : 'white',
              }}
            >
              {org.name} · {org.organizationType} · {org.role}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
