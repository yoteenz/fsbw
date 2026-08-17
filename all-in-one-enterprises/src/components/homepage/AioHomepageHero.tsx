import { aioAppConfig } from '../../config/appConfig';
import { aioPaths } from '../../utils/paths';
import { AIOButton } from '../AIOButton';
import { StartBusinessCtaButton } from '../journey/StartBusinessCtaButton';
import { useTranslation } from 'react-i18next';

export function AioHomepageHero() {
  const { t } = useTranslation('homepage');

  return (
    <section
      className="aio-home-hero"
      aria-labelledby="aio-home-hero-heading"
      style={
        {
          '--aio-hero-bg': `url(${aioAppConfig.assets.heroImage})`,
        } as React.CSSProperties
      }
    >
      <div className="aio-home-hero__bg" role="presentation" aria-hidden="true" />
      <div className="aio-home-hero__overlay" aria-hidden="true" />
      <div className="aio-home-hero__inner">
        <div className="aio-home-hero__content">
          <p className="aio-home-hero__eyebrow">{t('heroEyebrow')}</p>
          <h1 id="aio-home-hero-heading" className="aio-home-hero__headline">
            {t('heroHeadline1')}
            <br />
            {t('heroHeadline2')}
            <br />
            {t('heroHeadline3')}
            <br />
            <em>{t('heroHeadline4')}</em>
          </h1>
          <p className="aio-home-hero__sub">{t('heroSub')}</p>
          <div className="aio-home-hero__actions">
            <StartBusinessCtaButton variant="gold" className="aio-btn--block" showArrow />
            <AIOButton to={aioPaths.getStarted} variant="outline-gold" className="aio-btn--block" showArrow>
              {t('checkWhatINeed')}
            </AIOButton>
          </div>
        </div>
        <div className="aio-home-hero__visual" aria-hidden="true" />
      </div>
    </section>
  );
}
