import { homePathways } from '../data/homePathways';
import { AIOServicePathwayCard } from '../components/AIOServicePathwayCard';
import { AIOSectionHeader } from '../components/AIOSectionHeader';

export function ServicePathwaysSection() {
  return (
    <section className="aio-section aio-section--light aio-section--spacious" aria-labelledby="aio-pathways-heading">
      <div className="aio-container">
        <AIOSectionHeader
          align="center"
          eyebrow="What do you need help with?"
          title="Solutions for every stage of your journey"
        />
        <div className="aio-pathway-grid" id="aio-pathways-heading">
          {homePathways.map((pathway) => (
            <AIOServicePathwayCard key={pathway.id} pathway={pathway} />
          ))}
        </div>
      </div>
    </section>
  );
}
