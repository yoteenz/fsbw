import { useTranslation } from 'react-i18next';
import { AIOButton } from '../../components/AIOButton';
import { aioPaths } from '../../utils/paths';
import { usePageMeta } from '../../hooks/usePageMeta';
import { DRIVERLINK_LEGAL_DISCLOSURES } from '../../driverlink/driverlinkConfig';

export function DriverLinkPublicPage() {
  const { t } = useTranslation('driverLink');
  usePageMeta({
    title: 'AIO DriverLink — Find Drivers & Driving Opportunities',
    description: t('tagline'),
  });

  return (
    <div className="aio-dl-public aio-ps-page">
      <section className="aio-ps-hero aio-dl-public__hero">
        <p className="aio-ps-eyebrow">{t('productName')}</p>
        <h1 className="aio-ps-hero__title">
          {t('heroTitle1')}
          <br />
          {t('heroTitle2')}
        </h1>
        <p className="aio-ps-hero__lead">{t('heroLead')}</p>
        <div className="aio-dl-pathways">
          <article className="aio-dl-pathway-card">
            <h2>{t('imADriver')}</h2>
            <AIOButton to={aioPaths.driverLinkDriverPortal} variant="gold" showArrow>
              {t('findDrivingWork')} →
            </AIOButton>
          </article>
          <article className="aio-dl-pathway-card">
            <h2>{t('imACompany')}</h2>
            <AIOButton to={aioPaths.portalDriverLink} variant="outline-gold" showArrow>
              {t('findADriver')} →
            </AIOButton>
          </article>
        </div>
        <p className="aio-dl-disclosure">{DRIVERLINK_LEGAL_DISCLOSURES.marketplace}</p>
      </section>

      <section className="aio-ps-section">
        <h2 className="aio-ps-section__title">{t('howItWorks')}</h2>
        <ol className="aio-dl-steps">
          <li>{t('step1')}</li>
          <li>{t('step2')}</li>
          <li>{t('step3')}</li>
          <li>{t('step4')}</li>
        </ol>
      </section>

      <section className="aio-ps-section">
        <AIOButton to={aioPaths.login} variant="gold">
          Log In
        </AIOButton>
      </section>
    </div>
  );
}

export function DriverLinkDriverSignupPage() {
  const { t } = useTranslation('driverLink');
  usePageMeta({ title: t('createProfile') });
  return (
    <div className="aio-dl-public aio-ps-page">
      <h1>{t('createProfile')}</h1>
      <p>{t('heroLead')}</p>
      <AIOButton to={aioPaths.driverLinkDriverPortal} variant="gold">
        {t('driverPortal')}
      </AIOButton>
    </div>
  );
}
