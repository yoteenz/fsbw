import { useMemo, useState } from 'react';
import { Site00PublicShell } from '../components/shell/Site00PublicShell';
import {
  BracketHeading,
  EmptyState,
  FilterTabs,
  PageIntro,
  SearchField,
} from '../components/pages/Site00PagePrimitives';
import { SITE00_JOURNAL_CATEGORIES, SITE00_JOURNAL_SEED } from '../config/seed/site00-page-seed';

const TABS = SITE00_JOURNAL_CATEGORIES.map((c) => ({ id: c.toLowerCase(), label: c }));

export default function JournalPage() {
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const articles = useMemo(() => {
    let list = SITE00_JOURNAL_SEED;
    if (category !== 'all') {
      list = list.filter((a) => a.category.toLowerCase() === category);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((a) => a.title.toLowerCase().includes(q) || a.excerpt.toLowerCase().includes(q));
    }
    return list;
  }, [category, query]);

  return (
    <Site00PublicShell>
      <div className="site00-page site00-page--journal">
        <PageIntro title={<BracketHeading>JOURNAL</BracketHeading>} subtitle="INSIGHTS, UPDATES, AND STORIES FROM SITE 00." />
        <div className="site00-page-toolbar">
          <FilterTabs tabs={TABS} active={category} onChange={setCategory} />
          <SearchField value={query} onChange={setQuery} placeholder="SEARCH ARTICLES…" id="journal-search" />
        </div>
        {articles.length === 0 ? (
          <EmptyState title="NO ARTICLES YET" body="JOURNAL ENTRIES WILL APPEAR HERE WHEN PUBLISHED." />
        ) : (
          <div className="site00-journal-grid">
            {articles.map((article) => (
              <article key={article.id} className="site00-journal-card">
                <p className="site00-label-red">{article.category}</p>
                <h2 className="site00-journal-card__title">{article.title}</h2>
                <p className="site00-journal-card__excerpt">{article.excerpt}</p>
                <p className="site00-journal-card__meta">
                  {article.date} · {article.readMinutes} min read →
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </Site00PublicShell>
  );
}
