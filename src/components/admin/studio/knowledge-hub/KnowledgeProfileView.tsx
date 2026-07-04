import { useNavigate } from 'react-router-dom';
import type { KnowledgeObjectProfile } from '../../../../utils/adminStudioKnowledgeHubDemo';
import { KNOWLEDGE_PROFILE_TYPE_LABELS } from '../../../../utils/adminStudioKnowledgeHubDemo';
import { KH_VISUAL, khActionBtn, khCaption, khPanelStyle, khSectionTitle } from './knowledgeHubTheme';

function TagList({ title, items }: { title: string; items?: string[] }) {
  if (!items?.length) return null;
  return (
    <section className="mb-3">
      <p style={khSectionTitle}>{title}</p>
      <div className="flex flex-wrap gap-1">
        {items.map((item) => (
          <span
            key={item}
            style={{
              ...khCaption,
              border: KH_VISUAL.border,
              padding: '2px 6px',
              color: KH_VISUAL.black,
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </section>
  );
}

type KnowledgeProfileViewProps = {
  profile: KnowledgeObjectProfile;
};

export function KnowledgeProfileView({ profile }: KnowledgeProfileViewProps) {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex gap-3 mb-3">
        {profile.previewSrc ? (
          <div style={{ width: 72, height: 48, border: KH_VISUAL.border, flexShrink: 0, overflow: 'hidden' }}>
            <img src={profile.previewSrc} alt="" className="w-full h-full object-cover" />
          </div>
        ) : null}
        <div>
          <p style={{ ...khCaption, color: KH_VISUAL.red }}>{KNOWLEDGE_PROFILE_TYPE_LABELS[profile.type]}</p>
          <p style={{ ...khSectionTitle, fontSize: '12px' }}>{profile.name}</p>
          {profile.factoryStatus ? (
            <p style={{ ...khCaption, color: KH_VISUAL.pass }}>{profile.factoryStatus}</p>
          ) : null}
        </div>
      </div>

      <section className="mb-3">
        <p style={khSectionTitle}>PURPOSE</p>
        <p style={{ ...khCaption, color: KH_VISUAL.black }}>{profile.purpose}</p>
      </section>

      {profile.whyItExists ? (
        <section className="mb-3">
          <p style={khSectionTitle}>WHY IT EXISTS</p>
          <p style={{ ...khCaption, color: KH_VISUAL.black }}>{profile.whyItExists}</p>
        </section>
      ) : null}

      <TagList title="TYPICAL USES" items={profile.typicalUses} />
      <TagList title="BEST FOR" items={profile.bestFor} />
      <TagList title="AVOID" items={profile.avoid} />
      <TagList title="RECOMMENDED TALENT" items={profile.recommendedTalent} />
      <TagList title="RECOMMENDED CAMERAS" items={profile.recommendedCameras} />
      <TagList title="RECOMMENDED LIGHTING" items={profile.recommendedLighting} />
      <TagList title="ASSOCIATED PROPS" items={profile.associatedProps} />
      <TagList title="CONTENT PACKS" items={profile.contentPacks} />

      {profile.episodeLength || profile.publishingSchedule ? (
        <section className="mb-3" style={{ ...khPanelStyle, padding: '8px' }}>
          {profile.episodeLength ? <p style={khCaption}>EPISODE · {profile.episodeLength}</p> : null}
          {profile.publishingSchedule ? <p style={khCaption}>SCHEDULE · {profile.publishingSchedule}</p> : null}
          {profile.defaultStudio ? <p style={khCaption}>DEFAULT STUDIO · {profile.defaultStudio}</p> : null}
          {profile.targetAudience ? <p style={khCaption}>AUDIENCE · {profile.targetAudience}</p> : null}
          {profile.typicalCta ? <p style={khCaption}>CTA · {profile.typicalCta}</p> : null}
        </section>
      ) : null}

      {profile.biography ? (
        <section className="mb-3">
          <p style={khSectionTitle}>BIOGRAPHY</p>
          <p style={{ ...khCaption, color: KH_VISUAL.black }}>{profile.biography}</p>
        </section>
      ) : null}

      {profile.relationshipChain?.length ? (
        <section className="mb-3">
          <p style={khSectionTitle}>RELATED OBJECTS</p>
          {profile.relationshipChain.map((link, i) => (
            <div key={link.label} className="flex items-center gap-2 mb-1">
              {i > 0 ? <span style={khCaption}>↓</span> : null}
              <span style={{ ...khCaption, color: KH_VISUAL.gray, minWidth: 56 }}>{link.kind}</span>
              <button type="button" onClick={() => navigate(link.route)} style={khActionBtn}>
                {link.label}
              </button>
            </div>
          ))}
        </section>
      ) : null}

      {profile.relatedBlueprint ? (
        <button
          type="button"
          onClick={() => navigate(profile.relatedBlueprint!.route)}
          style={{ ...khActionBtn, color: KH_VISUAL.red, width: '100%', marginBottom: '8px' }}
        >
          {profile.relatedBlueprint.label}
        </button>
      ) : null}

      {profile.exampleProductions?.length ? (
        <section className="mb-3">
          <p style={khSectionTitle}>EXAMPLE GALLERY</p>
          <div className="grid grid-cols-2 gap-2">
            {profile.exampleProductions.map((ex) => (
              <div key={ex.title} style={{ ...khPanelStyle, padding: '4px' }}>
                {ex.previewSrc ? (
                  <img src={ex.previewSrc} alt="" className="w-full aspect-video object-cover mb-1" />
                ) : null}
                <p style={{ ...khCaption, color: KH_VISUAL.black, fontSize: '8px' }}>{ex.title}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
