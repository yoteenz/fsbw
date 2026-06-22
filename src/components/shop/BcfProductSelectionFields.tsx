import {
  BCF_ORIGIN_OPTIONS,
  BCF_LENGTH_OPTIONS,
  BCF_TEXTURE_LABELS,
  BCF_LACE_TREATMENT_OPTIONS,
  bcfOptionSelectedChrome,
  type BcfOriginId,
} from '../../utils/bcfProductOptions';
import type { BcfPdpCategory, BcfPdpTexture } from '../../utils/bcfPdpHeroAssets';
import { isPremiumMemberForGatedFeatures } from '../../utils/premiumMemberAccess';
import { BcfColorSwatchDonut } from './BcfColorSwatchDonut';
import {
  bcfBohemySubLabelStyle,
  bcfOptionBtnTypography,
  BCF_OPTION_RED,
} from './bcfSelectionStyles';

type Props = {
  category: BcfPdpCategory;
  texture: BcfPdpTexture;
  textureOrder: BcfPdpTexture[];
  bcfOrigin: BcfOriginId;
  bcfLength: string;
  bcfColor: string;
  bcfLace: string;
  bcfLaceTreatment: string[];
  bcfColorsAvailable: ReturnType<typeof import('../../utils/bcfProductOptions').bcfColorOptionsForOrigin>;
  allowedBcfTextures: BcfPdpTexture[];
  bcfLaceOptions: ReturnType<typeof import('../../utils/bcfProductOptions').bcfLaceOptionsForCategory>;
  onSelectOrigin: (origin: BcfOriginId) => void;
  onSelectTexture: (texture: BcfPdpTexture) => void;
  onSelectColor: (colorId: string) => void;
  onSelectLength: (lengthId: string) => void;
  onSelectLace: (laceId: string) => void;
  onToggleLaceTreatment: (id: string) => void;
  compact?: boolean;
};

export function BcfProductSelectionFields({
  category,
  texture,
  textureOrder,
  bcfOrigin,
  bcfLength,
  bcfColor,
  bcfLace,
  bcfLaceTreatment,
  bcfColorsAvailable,
  allowedBcfTextures,
  bcfLaceOptions,
  onSelectOrigin,
  onSelectTexture,
  onSelectColor,
  onSelectLength,
  onSelectLace,
  onToggleLaceTreatment,
  compact = false,
}: Props) {
  const isPremiumMember = isPremiumMemberForGatedFeatures();

  return (
    <div className={`bcf-selection-fields${compact ? ' bcf-selection-fields--compact' : ''}`}>
      <p className="bcf-selection-fields__profile-label">hair profile</p>
      <div className="bcf-selection-fields__row">
        {BCF_ORIGIN_OPTIONS.map((o) => {
          const sel = bcfOrigin === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelectOrigin(o.id)}
              style={{ ...bcfOptionBtnTypography, ...bcfOptionSelectedChrome(sel) }}
            >
              {o.label}
            </button>
          );
        })}
      </div>

      <p style={bcfBohemySubLabelStyle}>hair texture</p>
      <div className="bcf-selection-fields__row">
        {textureOrder.map((tid) => {
          const allowed = allowedBcfTextures.includes(tid);
          const active = texture === tid;
          return (
            <button
              key={tid}
              type="button"
              disabled={!allowed}
              onClick={() => onSelectTexture(tid)}
              style={{
                ...bcfOptionBtnTypography,
                ...bcfOptionSelectedChrome(active),
                cursor: allowed ? 'pointer' : 'not-allowed',
                opacity: allowed ? 1 : 0.35,
              }}
            >
              {BCF_TEXTURE_LABELS[tid]}
            </button>
          );
        })}
      </div>

      {(category === 'closures' || category === 'frontals') && (
        <>
          <p style={bcfBohemySubLabelStyle}>lace size</p>
          <div className="bcf-selection-fields__row bcf-selection-fields__row--lace">
            {bcfLaceOptions.map((l) => {
              const sel = bcfLace === l.id;
              return (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => onSelectLace(l.id)}
                  style={{
                    ...bcfOptionBtnTypography,
                    ...bcfOptionSelectedChrome(sel),
                    minWidth: '68px',
                  }}
                >
                  {l.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <p style={bcfBohemySubLabelStyle}>hair length</p>
      <div className="bcf-selection-fields__grid">
        {BCF_LENGTH_OPTIONS.map((len) => {
          const sel = bcfLength === len.id;
          return (
            <button
              key={len.id}
              type="button"
              onClick={() => onSelectLength(len.id)}
              style={{
                ...bcfOptionBtnTypography,
                ...bcfOptionSelectedChrome(sel),
                width: '100%',
                minWidth: 0,
              }}
            >
              {len.label}
            </button>
          );
        })}
      </div>

      {(category === 'closures' || category === 'frontals') && (
        <>
          <p style={bcfBohemySubLabelStyle}>lace treatment</p>
          <div className="bcf-selection-fields__row">
            {BCF_LACE_TREATMENT_OPTIONS.map((t) => {
              const sel = bcfLaceTreatment.includes(t.id);
              const locked = !!t.premium && !isPremiumMember;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onToggleLaceTreatment(t.id)}
                  style={{
                    ...bcfOptionBtnTypography,
                    ...bcfOptionSelectedChrome(sel),
                    ...(locked && !sel
                      ? { color: '#9ca3af', border: '1.3px solid #9ca3af', opacity: 0.5 }
                      : {}),
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </>
      )}

      <p style={bcfBohemySubLabelStyle}>hair color</p>
      <div className="bcf-selection-fields__colors">
        {bcfColorsAvailable.map((c) => {
          const sel = bcfColor === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => onSelectColor(c.id)}
              className="bcf-selection-fields__color-chip"
              style={{
                ...bcfOptionSelectedChrome(sel),
              }}
            >
              <BcfColorSwatchDonut colorCode={c.swatch} />
              <span
                style={{
                  color: sel ? BCF_OPTION_RED : '#000000',
                }}
              >
                {c.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
