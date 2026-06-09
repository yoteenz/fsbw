/** Wig unit PDP — DETAILS tab (NOIR layout; per-unit specs from config). */

import {
  NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE,
  NOIR_PRODUCT_TAB_ROSE_ALERT_SRC,
} from './noirProductTabRoseBadge';
import {
  UNIT_PDP_TAB_BODY_STYLE,
  UNIT_PDP_TAB_BULLET_MARK_STYLE,
  UNIT_PDP_TAB_BULLET_STYLE,
  UNIT_PDP_TAB_SECTION_TITLE_STYLE,
} from './unitPdpTabStyles';
import { getUnitPdpDetailsConfig, type WigUnitKey } from '../../utils/unitPdpDetailsConfig';

interface UnitProductDetailsTabProps {
  unitKey: WigUnitKey;
}

export default function UnitProductDetailsTab({ unitKey }: UnitProductDetailsTabProps) {
  const { intro, bullets, signatureFeatures } = getUnitPdpDetailsConfig(unitKey);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <p style={{ ...UNIT_PDP_TAB_BODY_STYLE, marginBottom: '4px' }}>{intro}</p>

      {bullets.map((bullet) => (
        <p key={bullet} style={UNIT_PDP_TAB_BULLET_STYLE}>
          <span style={UNIT_PDP_TAB_BULLET_MARK_STYLE}>•</span> {bullet}
        </p>
      ))}

      <p style={UNIT_PDP_TAB_SECTION_TITLE_STYLE}>signature features</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {signatureFeatures.map((label) => (
          <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
            <img src={NOIR_PRODUCT_TAB_ROSE_ALERT_SRC} alt="" style={NOIR_PRODUCT_TAB_ROSE_ALERT_BADGE_STYLE} />
            <p style={UNIT_PDP_TAB_BODY_STYLE}>{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
