import { Link } from 'react-router-dom';
import { homepagePathways } from '../../data/homepageMobileContent';
import { aioPaths } from '../../utils/paths';

export function AioPathwayRouter() {
  return (
    <section className="aio-home-section aio-home-pathways" aria-labelledby="aio-home-pathways-heading">
      <p className="aio-home-eyebrow">What can we help you do?</p>
      <h2 id="aio-home-pathways-heading" className="aio-home-section__sr">
        Customer pathways
      </h2>
      <ul className="aio-home-pathways__list">
        {homepagePathways.map((pathway) => (
          <li key={pathway.id}>
            <Link to={pathway.href} className="aio-home-pathway">
              <img src={pathway.iconSrc} alt="" className="aio-home-pathway__icon" width={40} height={40} />
              <div className="aio-home-pathway__body">
                <h3 className="aio-home-pathway__title">{pathway.title}</h3>
                <p className="aio-home-pathway__desc">{pathway.description}</p>
                <span className="aio-home-pathway__cta">
                  {pathway.ctaLabel} →
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      <Link to={aioPaths.services} className="aio-home-pathways__view-all">
        View All Services →
      </Link>
    </section>
  );
}
