import { Link } from 'react-router-dom';
import { roadReadyTeaserCategories } from '../data/homePathways';
import { AIORoadReadyTeaserRing } from '../components/AIORoadReadyTeaserRing';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOButton } from '../components/AIOButton';
import { aioPaths } from '../utils/paths';

export function RoadReadyTeaserSection() {
  return (
    <section className="aio-section aio-section--dark aio-road-ready-teaser" aria-labelledby="aio-road-ready-heading">
      <div className="aio-container aio-road-ready-teaser__grid">
        <div>
          <AIOSectionHeader
            light
            eyebrow="Don't know what you need?"
            title="See exactly what stands between you and the road."
            subtitle="Answer a few questions about your business and Road Ready™ builds your personalized startup and compliance roadmap."
          />
          <div className="aio-road-ready-teaser__cta">
            <Link to={aioPaths.getStarted}>
              <AIOButton variant="gold">Get My Roadmap →</AIOButton>
            </Link>
          </div>
        </div>
        <div className="aio-road-ready-teaser__visual" id="aio-road-ready-heading">
          <AIORoadReadyTeaserRing />
          <div className="aio-road-ready-teaser__list-wrap">
            <p className="aio-road-ready-teaser__list-title">Your roadmap covers:</p>
            <ul className="aio-road-ready-teaser__list">
              {roadReadyTeaserCategories.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
