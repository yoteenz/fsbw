/**
 * Living Knowledge Mirror — Knowledge Confessional (quick expert updates)
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CONFESSIONAL_PROMPTS } from '../../../studio-os-core/expert-capture/knowledge-mirror';
import { useKnowledgeMirror } from '../../../hooks/useKnowledgeMirror';
import { mirrorStyles, MirrorBtn } from './mirror-styles';
import { loadSessionIdentity, mirrorNavLinks, resolveProfileFromSlug } from './resolve-profile';

export default function ConfessionalPage({ profileSlug }: { profileSlug?: string }) {
  const profile = resolveProfileFromSlug(profileSlug);
  const identity = loadSessionIdentity(profile);
  const nav = mirrorNavLinks(profile);
  const km = useKnowledgeMirror(profile, identity);

  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!identity) {
    return (
      <div style={mirrorStyles.page}>
        <div style={mirrorStyles.container}>
          <h1 style={mirrorStyles.h1}>Knowledge Confessional</h1>
          <p style={mirrorStyles.sub}>Complete interview setup first so we know which expert program to update.</p>
          <MirrorBtn primary onClick={() => (window.location.href = nav.interview)}>
            Go to Interview
          </MirrorBtn>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (!transcript.trim()) return;
    km.submitConfessional({
      transcript,
      summary: summary || transcript.slice(0, 200),
      jurisdiction: jurisdiction || null,
      requiresOwnerApproval: true,
      visibility: isDraft ? 'private_draft' : 'owner_review',
    });
    setSubmitted(true);
    setTranscript('');
    setSummary('');
  };

  return (
    <div style={mirrorStyles.page}>
      <div style={mirrorStyles.container}>
        <nav style={mirrorStyles.nav}>
          <Link to={nav.stream} style={{ fontSize: 14, color: '#525252' }}>
            ← Knowledge Stream
          </Link>
          <Link to={nav.interview} style={{ fontSize: 14, color: '#525252' }}>
            Interview
          </Link>
        </nav>

        <h1 style={mirrorStyles.h1}>Knowledge Confessional</h1>
        <p style={mirrorStyles.sub}>
          Short, mobile-first updates — corrections, industry changes, exceptions, and reflections. Private drafts stay
          expert-only until you submit for review.
        </p>

        {submitted ? (
          <div style={{ ...mirrorStyles.card, background: '#ecfdf5', borderColor: '#86efac' }}>
            <p style={{ margin: 0 }}>Update saved. {isDraft ? 'Stored as private draft.' : 'Owner will be notified.'}</p>
            <MirrorBtn onClick={() => setSubmitted(false)}>Record Another</MirrorBtn>
          </div>
        ) : null}

        <div style={mirrorStyles.card}>
          <p style={{ fontSize: 13, color: '#737373', margin: '0 0 12px' }}>Speak or type naturally — e.g. “The city changed its permitting process.”</p>
          <textarea
            style={mirrorStyles.textarea}
            placeholder="What changed? What do you need to teach or correct?"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
          />
          <input
            style={mirrorStyles.input}
            placeholder="Short summary (optional)"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
          />
          <input
            style={mirrorStyles.input}
            placeholder="Jurisdiction / client type / software version (if applicable)"
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
          />
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 14 }}>
            <input type="checkbox" checked={isDraft} onChange={(e) => setIsDraft(e.target.checked)} />
            Save as private draft (owner cannot see yet)
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <MirrorBtn primary onClick={handleSubmit} disabled={!transcript.trim()}>
              {isDraft ? 'Save Draft' : 'Submit for Review'}
            </MirrorBtn>
          </div>
        </div>

        <h2 style={mirrorStyles.sectionTitle}>Follow-up prompts</h2>
        <ul style={{ fontSize: 14, color: '#525252', lineHeight: 1.7, paddingLeft: 20 }}>
          {CONFESSIONAL_PROMPTS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
