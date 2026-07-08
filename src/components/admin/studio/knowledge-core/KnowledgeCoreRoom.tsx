import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAllKnowledgeEntries,
  getEntriesByDomain,
  getEntryVersionHistory,
  getRelatedKnowledgeEntries,
  listRegisteredDomains,
  queryKnowledgeCore,
  type KnowledgeCoreDomain,
  type KnowledgeCoreEntry,
} from '../../../../studio-os-core/studio-world-knowledge-core';
import { useStudioWorldExperienceOptional } from '../global-experience';
import { PresenceGated } from '../progressive-presence/PresenceGated';
import { useKnowledgeCoreState } from '../../../../hooks/useKnowledgeCoreState';
import { KNOWLEDGE_CORE_STYLES } from './knowledgeCoreTheme';

const STATUS_FILTERS = ['Canon', 'Approved', 'Draft', 'Experimental', 'Historical'] as const;

/**
 * Knowledge Core Observatory™ — Studio World's canonical intelligence repository.
 * Architecture first; memory emerges through Progressive Presence™.
 * Founder-facing language only — no engineering complexity exposed.
 */
export function KnowledgeCoreRoom() {
  const navigate = useNavigate();
  const experience = useStudioWorldExperienceOptional();
  const { profile } = useKnowledgeCoreState();

  const domains = useMemo(() => listRegisteredDomains(), []);
  const allEntries = useMemo(() => getAllKnowledgeEntries(), []);

  const [activeDomain, setActiveDomain] = useState<KnowledgeCoreDomain>(domains[0]?.id ?? 'Knowledge Engine™');
  const [activeEntry, setActiveEntry] = useState<KnowledgeCoreEntry>(allEntries[0]!);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  const domainEntries = useMemo(
    () => getEntriesByDomain(activeDomain),
    [activeDomain]
  );

  const searchHits = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return queryKnowledgeCore(searchQuery, 6);
  }, [searchQuery]);

  const filteredDomainEntries = useMemo(() => {
    if (!statusFilter) return domainEntries;
    if (statusFilter === 'Historical') {
      return domainEntries.filter(
        (e) => e.status === 'Historical' || e.status === 'Deprecated' || e.status === 'Archived'
      );
    }
    return domainEntries.filter((e) => e.status === statusFilter);
  }, [domainEntries, statusFilter]);

  const versionHistory = useMemo(
    () => getEntryVersionHistory(activeEntry.id),
    [activeEntry.id]
  );

  const relatedEntries = useMemo(
    () => getRelatedKnowledgeEntries(activeEntry.id).slice(0, 4),
    [activeEntry.id]
  );

  const archivistTicker = useMemo(
    () => (profile?.archivistLines ?? []).join(' · '),
    [profile?.archivistLines]
  );

  const memoryCount = profile?.entryCount ?? allEntries.length;
  const canonCount = profile?.canonCount ?? allEntries.filter((e) => e.status === 'Canon').length;

  const revealDetail = useCallback(() => {
    experience?.presence.revealLevel(2);
  }, [experience]);

  const selectEntry = useCallback(
    (entry: KnowledgeCoreEntry) => {
      setActiveEntry(entry);
      setActiveDomain(entry.domain);
      setSearchQuery('');
      revealDetail();
    },
    [revealDetail]
  );

  return (
    <>
      <style>{KNOWLEDGE_CORE_STYLES}</style>
      <div className="kc-room" role="application" aria-label="Knowledge Core Observatory">
        <header className="kc-room__hud">
          <button
            type="button"
            className="kc-room__back"
            onClick={() => navigate('/admin/studio/overview')}
            aria-label="Return to Executive Atrium"
          >
            ←
          </button>
          <div className="kc-room__title-block">
            <p className="kc-room__eyebrow">STUDIO ARCHIVES™</p>
            <p className="kc-room__title">Knowledge Core Observatory™</p>
          </div>
          <span className="kc-room__archivist-badge">ORB · ARCHIVIST</span>
        </header>

        <aside className="kc-room__domains" aria-label="Knowledge Domains">
          {domains.map((domain) => {
            const count = getEntriesByDomain(domain.id).length;
            return (
              <button
                key={domain.id}
                type="button"
                className={`kc-room__domain${activeDomain === domain.id ? ' is-active' : ''}`}
                onClick={() => {
                  setActiveDomain(domain.id);
                  const first = getEntriesByDomain(domain.id)[0];
                  if (first) setActiveEntry(first);
                  revealDetail();
                }}
              >
                {domain.orbProjectionLabel}
                <span className="kc-room__domain-count">{count} ENTRIES</span>
              </button>
            );
          })}
        </aside>

        <div className="kc-room__monument" aria-hidden={false}>
          <div className="kc-room__memory-ring">
            <span className="kc-room__memory-val">{memoryCount}</span>
            <span className="kc-room__memory-label">INSTITUTIONAL MEMORY</span>
          </div>
          <p className="kc-room__status">
            {canonCount} CANON™ · {domains.length} DOMAINS · ERA 1 KNOWLEDGE™
          </p>
        </div>

        <PresenceGated elementId="knowledge-entry-detail">
          <aside className="kc-room__detail" aria-label="Knowledge Entry">
            <p className="kc-room__detail-eyebrow">{activeEntry.domain}</p>
            <h2 className="kc-room__detail-title">{activeEntry.title}</h2>
            <span
              className={`kc-room__detail-status${activeEntry.status === 'Canon' ? ' is-canon' : ''}`}
            >
              {activeEntry.status}™ · {activeEntry.version.toUpperCase()}
            </span>
            <p className="kc-room__detail-copy">{activeEntry.summary}</p>

            <div className="kc-room__detail-section">
              <p className="kc-room__detail-section-title">WHY THIS EXISTS</p>
              <p className="kc-room__detail-copy">{activeEntry.reasoning}</p>
            </div>

            {versionHistory.length > 1 ? (
              <div className="kc-room__detail-section">
                <p className="kc-room__detail-section-title">VERSION LINEAGE</p>
                {versionHistory.map((v) => (
                  <p key={v.version} className="kc-room__version-line">
                    {v.version.toUpperCase()} · {v.status}™
                  </p>
                ))}
              </div>
            ) : null}

            {activeEntry.relatedSystems.length > 0 ? (
              <div className="kc-room__detail-section">
                <p className="kc-room__detail-section-title">RELATED SYSTEMS</p>
                <div className="kc-room__chip-row">
                  {activeEntry.relatedSystems.map((s) => (
                    <span key={s} className="kc-room__chip">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {relatedEntries.length > 0 ? (
              <div className="kc-room__detail-section">
                <p className="kc-room__detail-section-title">CONNECTED MEMORY</p>
                <div className="kc-room__chip-row">
                  {relatedEntries.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="kc-room__chip"
                      onClick={() => selectEntry(e)}
                    >
                      {e.title.slice(0, 28)}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {filteredDomainEntries.length > 1 ? (
              <div className="kc-room__detail-section">
                <p className="kc-room__detail-section-title">DOMAIN ENTRIES</p>
                <div className="kc-room__chip-row">
                  {filteredDomainEntries.map((e) => (
                    <button
                      key={e.id}
                      type="button"
                      className="kc-room__chip"
                      onClick={() => selectEntry(e)}
                    >
                      {e.id}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </PresenceGated>

        <PresenceGated elementId="knowledge-status-tray">
          <div
            style={{
              position: 'absolute',
              right: 10,
              top: 56,
              zIndex: 11,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 4,
              maxWidth: 120,
            }}
            aria-label="Status filters"
          >
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                type="button"
                className="kc-room__chip"
                style={{
                  cursor: 'pointer',
                  borderColor: statusFilter === s ? 'rgba(201,169,98,0.5)' : undefined,
                }}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
              >
                {s}
              </button>
            ))}
          </div>
        </PresenceGated>

        {searchHits.length > 0 ? (
          <div className="kc-room__results" role="listbox" aria-label="Search results">
            {searchHits.map((hit) => (
              <button
                key={hit.entry.id}
                type="button"
                className="kc-room__result"
                onClick={() => selectEntry(hit.entry)}
              >
                {hit.entry.title}
                <span className="kc-room__result-meta">
                  {hit.domainLabel} · {hit.matchReason}
                  {hit.canInfluenceArchitecture ? ' · CANON INFLUENCE' : ''}
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <footer className="kc-room__dock">
          <div className="kc-room__search-row">
            <input
              className="kc-room__search"
              placeholder="Ask the civilization — Orb, Atlas, decisions, presence…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={revealDetail}
              aria-label="Search institutional memory"
            />
          </div>
          <p className="kc-room__archivist-ticker" aria-live="polite">
            {archivistTicker}
          </p>
        </footer>
      </div>
    </>
  );
}
