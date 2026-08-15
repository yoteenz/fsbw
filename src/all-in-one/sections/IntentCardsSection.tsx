import { intentCards } from '../data/mockServices';
import { AIOIntentCard } from '../components/AIOIntentCard';
import { AIOSectionHeader } from '../components/AIOSectionHeader';

export function IntentCardsSection() {
  const row1 = intentCards.filter((c) => c.row === 1);
  const row2 = intentCards.filter((c) => c.row === 2);

  return (
    <section className="aio-section aio-section--light" aria-labelledby="aio-intent-heading">
      <div className="aio-container">
        <div style={{ marginBottom: '2.5rem' }}>
          <AIOSectionHeader
            eyebrow="Customer Discovery"
            title="What Are You Looking To Do?"
            subtitle="Choose your path — from startup and compliance through operations, cash flow, and freight."
          />
        </div>
        <div id="aio-intent-heading">
          <div className="aio-intent-grid aio-intent-grid--row1">
            {row1.map((card) => (
              <AIOIntentCard key={card.id} card={card} />
            ))}
          </div>
          <div className="aio-intent-grid aio-intent-grid--row2" style={{ marginTop: '1.25rem' }}>
            {row2.map((card) => (
              <AIOIntentCard key={card.id} card={card} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
