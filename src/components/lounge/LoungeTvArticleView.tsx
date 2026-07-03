import { useState } from 'react';
import type { LoungeContentPack } from './loungeTvContentPack';
import { relatedContentPacks, resolveContentPackFormat } from './loungeTvContentPack';
import { LoungeTvBackButton, LoungeTvCtaButton, loungeTvGlassPanelStyle } from './LoungeTvUiPrimitives';
import {
  LOUNGE_TV_BRAND_RED,
  LOUNGE_TV_FONT_BOOK,
  LOUNGE_TV_FONT_MEDIUM,
  LOUNGE_TV_GLASS_BORDER,
  LOUNGE_TV_TEXT_GRAY,
  LOUNGE_TV_TEXT_WHITE,
} from './loungeTvTheme';
import { loungeTvGlassCqw } from './loungeTvResponsive';
import { togglePackSaved, isPackSaved } from '../../utils/loungeTvLibrary';
import { useNavigate } from 'react-router-dom';

type LoungeTvArticleViewProps = {
  pack: LoungeContentPack;
  onBack: () => void;
  onWatchEpisode?: () => void;
};

export function LoungeTvArticleView({ pack, onBack, onWatchEpisode }: LoungeTvArticleViewProps) {
  const navigate = useNavigate();
  const [saved, setSaved] = useState(() => isPackSaved(pack.id));
  const related = relatedContentPacks(pack);
  const format = resolveContentPackFormat(pack);

  const handleSave = () => {
    setSaved(togglePackSaved(pack.id));
  };

  return (
    <article
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: loungeTvGlassCqw(1.2, 3, 6),
        textTransform: 'uppercase',
      }}
    >
      <LoungeTvBackButton onClick={onBack} />

      <header>
        <h1
          style={{
            margin: 0,
            fontFamily: LOUNGE_TV_FONT_MEDIUM,
            fontSize: loungeTvGlassCqw(2, 4.5, 9),
            color: LOUNGE_TV_TEXT_WHITE,
            lineHeight: 1.2,
          }}
        >
          {pack.title}
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: loungeTvGlassCqw(1, 2.5, 5),
            marginTop: loungeTvGlassCqw(0.5, 1.2, 2.5),
            flexWrap: 'wrap',
          }}
        >
          {pack.readTime ? (
            <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(1.3, 3, 6), color: LOUNGE_TV_BRAND_RED }}>
              {pack.readTime} READ
            </span>
          ) : null}
          {pack.difficulty ? (
            <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(1.3, 3, 6), color: LOUNGE_TV_TEXT_GRAY }}>
              {pack.difficulty}
            </span>
          ) : null}
          {pack.category ? (
            <span style={{ fontFamily: LOUNGE_TV_FONT_MEDIUM, fontSize: loungeTvGlassCqw(1.3, 3, 6), color: LOUNGE_TV_TEXT_GRAY }}>
              {pack.category}
            </span>
          ) : null}
        </div>
      </header>

      {pack.heroImage || pack.thumbnail ? (
        <img
          src={pack.heroImage ?? pack.thumbnail}
          alt=""
          draggable={false}
          style={{
            width: '100%',
            maxHeight: loungeTvGlassCqw(28, 64, 120),
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
            fontSize: loungeTvGlassCqw(1.35, 3.2, 6.5),
            lineHeight: 1.45,
            color: '#d0d0d0',
          }}
        >
          {pack.article.intro}
        </p>
      ) : null}

      {pack.article?.takeaways?.length ? (
        <section style={{ ...loungeTvGlassPanelStyle, padding: loungeTvGlassCqw(1, 2.5, 5) }}>
          <h2
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.6, 1.5, 3)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
              color: LOUNGE_TV_BRAND_RED,
            }}
          >
            KEY TAKEAWAYS
          </h2>
          <ul style={{ margin: 0, paddingLeft: loungeTvGlassCqw(2, 4.5, 9), listStyle: 'disc' }}>
            {pack.article.takeaways.map((item) => (
              <li
                key={item}
                style={{
                  fontFamily: LOUNGE_TV_FONT_BOOK,
                  fontSize: loungeTvGlassCqw(1.3, 3, 6),
                  lineHeight: 1.4,
                  color: LOUNGE_TV_BRAND_RED,
                  marginBottom: loungeTvGlassCqw(0.4, 1, 2),
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {pack.article?.steps?.map((step) => (
        <section key={step.title} style={{ borderTop: LOUNGE_TV_GLASS_BORDER, paddingTop: loungeTvGlassCqw(0.8, 2, 4) }}>
          <h3
            style={{
              margin: `0 0 ${loungeTvGlassCqw(0.4, 1, 2)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
              color: LOUNGE_TV_TEXT_WHITE,
            }}
          >
            {step.title}
          </h3>
          <p
            style={{
              margin: 0,
              fontFamily: LOUNGE_TV_FONT_BOOK,
              fontSize: loungeTvGlassCqw(1.3, 3, 6),
              lineHeight: 1.4,
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
              margin: `0 0 ${loungeTvGlassCqw(0.6, 1.5, 3)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
              color: LOUNGE_TV_TEXT_GRAY,
            }}
          >
            PRODUCTS USED
          </h2>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.4, 1, 2) }}>
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
                    fontSize: loungeTvGlassCqw(1.3, 3, 6),
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
              margin: `0 0 ${loungeTvGlassCqw(0.6, 1.5, 3)}`,
              fontFamily: LOUNGE_TV_FONT_MEDIUM,
              fontSize: loungeTvGlassCqw(1.4, 3.2, 6.5),
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
                fontSize: loungeTvGlassCqw(1.3, 3, 6),
                color: LOUNGE_TV_TEXT_WHITE,
              }}
            >
              {rel.title}
            </p>
          ))}
        </section>
      ) : null}

      <div style={{ display: 'flex', flexDirection: 'column', gap: loungeTvGlassCqw(0.7, 1.8, 3.5), marginTop: loungeTvGlassCqw(0.5, 1.2, 2.5) }}>
        {(format === 'BOTH' || format === 'WATCH') && onWatchEpisode ? (
          <LoungeTvCtaButton label="WATCH EPISODE" onClick={onWatchEpisode} fullWidth />
        ) : null}
        <LoungeTvCtaButton label="TRY IN BUILD-A-WIG" onClick={() => navigate('/build-a-wig')} fullWidth />
        <LoungeTvCtaButton label="SHOP THIS LOOK" onClick={() => navigate('/home/shop')} variant="ghost" fullWidth />
        <LoungeTvCtaButton label={saved ? 'SAVED TO SLAY BOARD' : 'SAVE TO SLAY BOARD'} onClick={handleSave} variant="ghost" fullWidth />
      </div>
    </article>
  );
}
