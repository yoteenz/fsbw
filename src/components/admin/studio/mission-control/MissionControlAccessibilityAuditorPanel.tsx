import { useNavigate } from 'react-router-dom';
import { useAccessibilityAuditorState } from '../../../../hooks/useAccessibilityAuditorState';
import { ACCESSIBILITY_AUDITOR_ACCENT } from '../../../../studio-os-core/accessibility-auditor';
import { adminStudioAccessibilityAuditorPath } from '../../../../utils/adminStudioRoutes';
import { ExecutiveHealthRing, ExecutiveSecondaryCard, eiaActionBtn, eiaCaption } from '../executive-ia';

/** Mission Control — Accessibility Auditor™ preview (M158). */
export function MissionControlAccessibilityAuditorPanel() {
  const navigate = useNavigate();
  const { profile } = useAccessibilityAuditorState();

  if (!profile) {
    return (
      <ExecutiveSecondaryCard title="ACCESSIBILITY AUDITOR™">
        <p style={{ ...eiaCaption, fontSize: '7px' }}>INCLUSIVE DESIGN AUDIT LOADING…</p>
      </ExecutiveSecondaryCard>
    );
  }

  return (
    <ExecutiveSecondaryCard title="ACCESSIBILITY AUDITOR™ · INCLUSIVE BY DESIGN">
      <div className="flex items-center gap-3 mb-3">
        <ExecutiveHealthRing value={profile.overallAccessibilityScore} size={52} label="A11Y" accent={ACCESSIBILITY_AUDITOR_ACCENT} />
        <div>
          <p style={{ ...eiaCaption, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
            {profile.pagesAudited} PAGES · WCAG {profile.averageWcagLevel}
          </p>
          <p style={{ ...eiaCaption, fontSize: '7px' }}>
            Inclusive design is premium design
          </p>
        </div>
      </div>
      <p style={{ ...eiaCaption, fontSize: '7px', marginBottom: 6, lineHeight: 1.45 }}>
        {profile.dockAccessibilityLine.slice(0, 110)}…
      </p>
      <button type="button" onClick={() => navigate(adminStudioAccessibilityAuditorPath())} style={eiaActionBtn}>
        OPEN ACCESSIBILITY AUDIT →
      </button>
    </ExecutiveSecondaryCard>
  );
}
