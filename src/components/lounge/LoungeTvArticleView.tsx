import { useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { relatedContentPacks, resolveContentPackFormat } from './loungeTvContentPack';
import { LoungeTvBackButton, LoungeTvCtaButton } from './LoungeTvUiPrimitives';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_GLASS_BORDER,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { LOUNGE_TV_DETAIL_TYPE } from './loungeTvTypography';
import { togglePackSaved, isPackSaved } from '../../utils/loungeTvLibrary';
import { useNavigate } from 'react-router-dom';

type LoungeTvArticleViewProps = {
  pack: LoungeContentPack;
  onBack: () => void;
  onWatchEpisode?: () => void;
};

function formatStepHeading(title: string, index: number): string {
  const normalized = title.trim().toUpperCase();
  if (/^STEP\s+\d+/i.test(normalized)) return normalized;
  return `STEP ${index + 1} — ${normalized}`;
}

export function LoungeTvArticleView({ pack, onBack, onWatchEpisode }: LoungeTvArticleViewProps) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => isPackSaved(pack.id));
  const related = relatedContentPacks(pack);
  const format = resolveContentPackFormat(pack);

  const metadataParts = [
    pack.readTime ? `${pack.readTime} READ` : null,
    pack.difficulty ?? null,
    pack.category ?? null,
  ].filter(Boolean);

  const handleSave = () => {
    setSaved(togglePackSaved(pack.id));
  };

  return (
    <article
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.3, 3.2, 6.5),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      <header>
        <h1
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: LOUNGE_TV_DETAIL_TYPE.pageTitle,
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.15,
          }}
        >
          {pack.title}
        </h1>
        {metadataParts.length ? (
          <p
            style={{
              margin: `${loungeTvGlassCqw(0.55, 1.3, 2.6)} 0 0`,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_DETAIL_TYPE.meta,
              color: LOUNGE_TV_TEXT_GRAY,
              letterSpacing: '0.05em',
              lineHeight: 1.35,
            }}
          >
            {metadataParts.join(' · ')}
          </p>
        ) : null}
      </header>

      {pack.heroImage || pack.thumbnail ? (
        <img
          src={pack.heroImage ?? pack.thumbnail}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            maxHeight: loungeTvGlassCqw(26, 58, 110),
            objectFit: 'cover',
            display: 'block',
            border: LOUNGE_TV_GLASS_BORDER,
          }}
        />
      ) : null}

      {pack.article?.intro ? (
        <p
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_BOOK,
            fontSize: LOUNGE_TV_DETAIL_TYPE.body,
            lineHeight: 1.5,
            color: '#d0d0d0',
          }}
        >
          {pack.article.intro}
        </p>
      ) : null}

      {pack.article?.takeaways?.length ? (
        <section
          style={{
            padding: loungeTvGlassCqw(1.1, 2.6, 5.2),
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.03)',
          }}
        >
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.75, 1.8, 3.6)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
              color: LOUNGE_TV_BRAND_RED,
              letterSpacing: '0.05em',
            }}
          >
            KEY TAKEAWAYS
          </h2>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: loungeTvGlassCqw(0.55, 1.3, 2.6),
            }}
          >
            {pack.article.takeaways.map((item) => (
              <li
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: loungeTvGlassCqw(0.6, 1.4, 2.8),
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: LOUNGE_TV_DETAIL_TYPE.body,
                  lineHeight: 1.4,
                  color: LOUNGE_TV_TEXT_WHITE,
                }}
              >
                <span style={{ color: LOUNGE_TV_BRAND_RED, flexShrink: 0 }}>•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pack.article?.steps?.map((step, index) => (
        <section
          key={step.title}
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: loungeTvGlassCqw(1, 2.4, 4.8),
          }}
        >
          <h3
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.5, 1.2, 2.4)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_DETAIL_TYPE.cardTitle,
              color: LOUNGE_TV_TEXT_WHITE,
              letterSpacing: '0.04em',
            }}
          >
            {formatStepHeading(step.title, index)}
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: LOUNGE_TV_DETAIL_TYPE.body,
              lineHeight: 1.45,
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            {step.body}
          </p>
        </section>
      ))}

      {pack.productsUsed?.length ? (
        <section>
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.65, 1.5, 3)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            PRODUCTS USED
          </h2>
          <ul
            style={{
              margin: 0,
              padding: 0,
              listStyle: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: loungeTvGlassCqw(0.45, 1.1, 2.2),
            }}
          >
            {pack.productsUsed.map((product) => (
              <li key={product.name}>
                <button
                  type="button"
                  onClick={() => product.shopHref && navigate(product.shopHref)}
                  style={{
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    background: 'none',
                    fontFamily: LOUNGE_TV_FONT_MEDIUM,
                    fontSize: LOUNGE_TV_DETAIL_TYPE.meta,
                    color: LOUNGE_TV_BRAND_RED,
                    cursor: product.shopHref ? 'pointer' : 'default',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.name}
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {related.length ? (
        <section>
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.65, 1.5, 3)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: LOUNGE_TV_DETAIL_TYPE.sectionTitle,
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            RELATED VIDEO
          </h2>
          {related.map((rel) => (
            <p
              key={rel.id}
              style={{
                margin: 0,
                fontFamily: LOUNGE_TV_FONT_MEDIUM,
                fontSize: LOUNGE_TV_DETAIL_TYPE.cardTitle,
                color: LOUNGE_TV_TEXT_WHITE,
              }}
            >
              {rel.title}
            </p>
          ))}
        </section>
      ) : null}

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: loungeTvGlassCqw(0.65, 1.5, 3),
          marginTop: loungeTvGlassCqw(0.5, 1.2, 2.5),
          paddingTop: loungeTvGlassCqw(0.8, 2, 4),
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {(format === 'BOTH' || format === 'WATCH') && onWatchEpisode ? (
          <LoungeTvCtaButton label="WATCH EPISODE" onClick={onWatchEpisode} fullWidth />
        ) : null}
        <LoungeTvCtaButton label="TRY IN BUILD-A-WIG" onClick={() => navigate('/build-a-wig')} variant="secondary" fullWidth />
        <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.5, 1.2, 2.4) }}>
          <LoungeTvCtaButton label="SHOP THIS LOOK >" onClick={() => navigate('/home/shop')} variant="tertiary" fullWidth />
          <LoungeTvCtaButton
            label={saved ? 'SAVED TO SLAY BOARD' : 'SAVE TO SLAY BOARD'}
            onClick={handleSave}
            variant="tertiary"
            fullWidth
          />
        </div>
      </div>
    </article>
  );
}
