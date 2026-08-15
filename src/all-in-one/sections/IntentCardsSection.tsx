import { intentCards } from '../data/mockServices';
import { AIOIntentCard } from '../components/AIOIntentCard';
import { AIOSectionHeader } from '../components/AIOSectionHeader';

export function IntentCardsSection() {
  return (
    <section className="aio-section aio-section--light" aria-labelledby="aio-intent-heading">
      <div className="aio-container">
        <div style={{ marginBottom: '2.5rem' }}>
          <AIOSectionHeader
            eyebrow="Customer Discovery"
            title="What Are You Looking To Do?"
            subtitle="Choose your path — we'll guide you from business setup through compliance, coverage, and operations."
          />
        </div>
        <div className="aio-intent-grid" id="aio-intent-heading">
          {intentCards.map((card) => (
            <AIOIntentCard key={card.id} card={card} />
          ))}
        </div>
      </div>
    </section>
  );
}
