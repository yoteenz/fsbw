import { mockRoadmapItems, mockRoadmapProgress } from '../data/mockRoadmap';
import { AIORoadmapProgress } from '../components/AIORoadmapProgress';
import { AIOSectionHeader } from '../components/AIOSectionHeader';
import { AIOCard } from '../components/AIOCard';

export function RoadmapSection() {
  return (
    <section className="aio-section aio-section--dark" aria-labelledby="aio-roadmap-heading">
      <div className="aio-container aio-two-col">
        <div>
          <AIOSectionHeader
            light
            eyebrow="The All In One Roadmap"
            title="Your path to operational readiness"
            subtitle="A visual prototype of the future onboarding and compliance system. Progress and checklist items are sample data."
          />
        </div>
        <div id="aio-roadmap-heading">
          <AIOCard dark>
            <AIORoadmapProgress progress={mockRoadmapProgress} items={mockRoadmapItems} />
          </AIOCard>
        </div>
      </div>
    </section>
  );
}
