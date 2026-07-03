import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { AdminStudioStageShell } from '../../../../../components/admin/studio/AdminStudioStageShell';
import { AdminStudioSectionHeading } from '../../../../../components/admin/studio/AdminStudioSectionHeading';
import { AdminStudioDisclaimerFooter } from '../../../../../components/admin/studio/AdminStudioDisclaimerFooter';
import { AdminStudioBrainFieldGroups } from '../../../../../components/admin/studio/AdminStudioBrainFieldGroups';
import { AdminStudioBrainListItem } from '../../../../../components/admin/studio/AdminStudioBrainListItem';
import { AdminStudioBrainFrameworkEditor } from '../../../../../components/admin/studio/AdminStudioBrainFrameworkEditor';
import { AdminStudioContentEngineWorkflow } from '../../../../../components/admin/studio/AdminStudioContentEngineWorkflow';
import { AdminStudioEditableField } from '../../../../../components/admin/studio/AdminStudioEditableField';
import { AdminStudioSearchInput } from '../../../../../components/admin/studio/AdminStudioSearchInput';
import { AdminStudioFilterBar } from '../../../../../components/admin/studio/AdminStudioFilterBar';
import {
  useContentBrainApproval,
  useContentBrainBrand,
  useContentBrainCalendar,
  useContentBrainCampaigns,
  useContentBrainCtas,
  useContentBrainEditorial,
  useContentBrainEngine,
  useContentBrainProducts,
  useContentBrainPromptFrameworks,
  useContentBrainPsa,
  useContentBrainShowBible,
} from '../../../../../hooks/useAdminStudioContentBrainState';
import {
  ADMIN_STUDIO_APPROVAL_RULES_GROUPS,
  ADMIN_STUDIO_APPROVAL_STATUSES,
  ADMIN_STUDIO_BRAND_BRAIN_GROUPS,
  ADMIN_STUDIO_EDITORIAL_RULES_GROUPS,
  ADMIN_STUDIO_PSA_PERSONALITY_GROUPS,
  getContentBrainSectionById,
  type ContentBrainSectionId,
} from '../../../../../utils/adminStudioContentBrainDemo';
import {
  CAMPAIGN_FRAMEWORK_FIELD_GROUPS,
  CAMPAIGN_FRAMEWORK_FIELD_LABELS,
} from '../../../../../utils/adminStudioContentBrainCampaignsDemo';
import {
  CTA_LIBRARY_FIELD_LABELS,
  PRODUCT_KNOWLEDGE_FIELD_GROUPS,
  PRODUCT_KNOWLEDGE_FIELD_LABELS,
} from '../../../../../utils/adminStudioContentBrainCatalogDemo';
import { PROMPT_FRAMEWORK_CATEGORIES } from '../../../../../utils/adminStudioContentBrainPromptFrameworksDemo';
import {
  CONTENT_BRAIN_SHOW_BIBLE_FIELD_GROUPS,
  CONTENT_BRAIN_SHOW_BIBLE_FIELD_LABELS,
} from '../../../../../utils/adminStudioContentBrainShowBibleDemo';
import { ADMIN_STUDIO_THEME } from '../../../../../utils/adminStudioTheme';

const VALID_SECTIONS = new Set<string>([
  'brand-brain',
  'psa-personality',
  'show-bible',
  'editorial-rules',
  'prompt-frameworks',
  'campaign-frameworks',
  'product-knowledge',
  'cta-library',
  'content-engine',
  'content-calendar',
  'approval-rules',
]);

export default function AdminStudioContentBrainSectionPage() {
  const { sectionId } = useParams<{ sectionId: string }>();
  const navigate = useNavigate();

  if (!sectionId || !VALID_SECTIONS.has(sectionId)) {
    return <Navigate to="/admin/studio/content-brain" replace />;
  }

  const section = getContentBrainSectionById(sectionId);
  if (!section) {
    return <Navigate to="/admin/studio/content-brain" replace />;
  }

  return (
    <AdminStudioStageShell
      title={section.title}
      subtitle="CONTENT BRAIN · EDITABLE INTELLIGENCE — NO AI CONNECTIONS"
      breadcrumbParentLabel="CONTENT BRAIN"
      breadcrumbParentPath="/admin/studio/content-brain"
      onBack={() => navigate('/admin/studio/content-brain')}
    >
      <ContentBrainSectionBody sectionId={sectionId as ContentBrainSectionId} />
      <AdminStudioDisclaimerFooter>
        ALL CHANGES PERSIST IN LOCALSTORAGE · PHASE 2 AI SERVICES READ FROM CONTENT BRAIN SNAPSHOT.
      </AdminStudioDisclaimerFooter>
    </AdminStudioStageShell>
  );
}

function ContentBrainSectionBody({ sectionId }: { sectionId: ContentBrainSectionId }) {
  switch (sectionId) {
    case 'brand-brain':
      return <BrandBrainSection />;
    case 'psa-personality':
      return <PsaPersonalitySection />;
    case 'show-bible':
      return <ShowBibleSection />;
    case 'editorial-rules':
      return <EditorialRulesSection />;
    case 'prompt-frameworks':
      return <PromptFrameworksSection />;
    case 'campaign-frameworks':
      return <CampaignFrameworksSection />;
    case 'product-knowledge':
      return <ProductKnowledgeSection />;
    case 'cta-library':
      return <CtaLibrarySection />;
    case 'content-engine':
      return <ContentEngineSection />;
    case 'content-calendar':
      return <ContentCalendarSection />;
    case 'approval-rules':
      return <ApprovalRulesSection />;
    default:
      return null;
  }
}

function BrandBrainSection() {
  const { fields, updateField } = useContentBrainBrand();
  return <AdminStudioBrainFieldGroups groups={ADMIN_STUDIO_BRAND_BRAIN_GROUPS} fields={fields} onUpdate={updateField} />;
}

function PsaPersonalitySection() {
  const { fields, updateField } = useContentBrainPsa();
  return (
    <>
      <p
        className="text-[8px] font-futura uppercase mb-3"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        NEVER ALLOW PSA TO SOUND ROBOTIC — CONVERSATION RULES ARE MANDATORY FOR ALL FUTURE AI DIALOGUE.
      </p>
      <AdminStudioBrainFieldGroups groups={ADMIN_STUDIO_PSA_PERSONALITY_GROUPS} fields={fields} onUpdate={updateField} />
    </>
  );
}

function EditorialRulesSection() {
  const { fields, updateField } = useContentBrainEditorial();
  return <AdminStudioBrainFieldGroups groups={ADMIN_STUDIO_EDITORIAL_RULES_GROUPS} fields={fields} onUpdate={updateField} />;
}

function ShowBibleSection() {
  const { shows, selectedId, setSelectedId, selectedShow, updateShowField } = useContentBrainShowBible();

  return (
    <div className="space-y-3">
      <AdminStudioSectionHeading>SHOW PROFILES</AdminStudioSectionHeading>
      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {shows.map((show) => (
          <AdminStudioBrainListItem
            key={show.id}
            title={show.name}
            subtitle={show.publishingSchedule}
            accentHex={show.accentHex}
            isSelected={selectedId === show.id}
            onSelect={() => setSelectedId(show.id)}
          />
        ))}
      </div>
      {selectedShow ? (
        <div className="space-y-4">
          {CONTENT_BRAIN_SHOW_BIBLE_FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <AdminStudioSectionHeading>{group.title}</AdminStudioSectionHeading>
              <div className="space-y-2 mt-2">
                {group.keys.map((key) => (
                  <AdminStudioEditableField
                    key={key}
                    label={CONTENT_BRAIN_SHOW_BIBLE_FIELD_LABELS[key]}
                    value={selectedShow[key]}
                    onChange={(v) => updateShowField(selectedShow.id, key, v)}
                    multiline={key !== 'name' && key !== 'host'}
                    accentHex={selectedShow.accentHex}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function PromptFrameworksSection() {
  const {
    filteredPrompts,
    favorites,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    selectedId,
    setSelectedId,
    selectedPrompt,
    updatePromptField,
    savePromptVersion,
    restorePromptVersion,
    toggleFavorite,
  } = useContentBrainPromptFrameworks();

  return (
    <div className="space-y-3">
      <AdminStudioSectionHeading>PROMPT FRAMEWORKS</AdminStudioSectionHeading>
      <AdminStudioSearchInput value={search} onChange={setSearch} placeholder="SEARCH FRAMEWORKS..." />
      <AdminStudioFilterBar
        items={[
          { id: 'all' as const, label: 'ALL' },
          { id: 'favorites' as const, label: `★ FAVS (${favorites.size})` },
          ...PROMPT_FRAMEWORK_CATEGORIES.map((c) => ({ id: c.id, label: c.label })),
        ]}
        activeId={categoryFilter}
        onChange={setCategoryFilter}
      />
      <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {filteredPrompts.map((p) => (
          <AdminStudioBrainListItem
            key={p.id}
            title={p.title}
            subtitle={p.category}
            isSelected={selectedId === p.id}
            onSelect={() => setSelectedId(p.id)}
          />
        ))}
      </div>
      {selectedPrompt ? (
        <AdminStudioBrainFrameworkEditor
          entry={selectedPrompt}
          isFavorite={favorites.has(selectedPrompt.id)}
          onToggleFavorite={() => toggleFavorite(selectedPrompt.id)}
          onUpdateField={(key, value) => updatePromptField(selectedPrompt.id, key, value)}
          onSaveVersion={(note) => savePromptVersion(selectedPrompt.id, note)}
          onRestoreVersion={(versionId) => restorePromptVersion(selectedPrompt.id, versionId)}
        />
      ) : null}
    </div>
  );
}

function CampaignFrameworksSection() {
  const { campaigns, selectedId, setSelectedId, selectedCampaign, updateCampaignField } = useContentBrainCampaigns();

  return (
    <div className="space-y-3">
      <AdminStudioSectionHeading>CAMPAIGN BLUEPRINTS</AdminStudioSectionHeading>
      <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {campaigns.map((c) => (
          <AdminStudioBrainListItem
            key={c.id}
            title={c.title}
            subtitle={c.type}
            isSelected={selectedId === c.id}
            onSelect={() => setSelectedId(c.id)}
          />
        ))}
      </div>
      {selectedCampaign ? (
        <div className="space-y-4">
          {CAMPAIGN_FRAMEWORK_FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <AdminStudioSectionHeading>{group.title}</AdminStudioSectionHeading>
              <div className="space-y-2 mt-2">
                {group.keys.map((key) => (
                  <AdminStudioEditableField
                    key={key}
                    label={CAMPAIGN_FRAMEWORK_FIELD_LABELS[key]}
                    value={selectedCampaign[key]}
                    onChange={(v) => updateCampaignField(selectedCampaign.id, key, v)}
                    multiline
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ProductKnowledgeSection() {
  const {
    filteredProducts,
    search,
    setSearch,
    selectedId,
    setSelectedId,
    selectedProduct,
    updateProductField,
  } = useContentBrainProducts();

  return (
    <div className="space-y-3">
      <AdminStudioSectionHeading>PRODUCT CATALOG</AdminStudioSectionHeading>
      <AdminStudioSearchInput value={search} onChange={setSearch} placeholder="SEARCH PRODUCTS..." />
      <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {filteredProducts.map((p) => (
          <AdminStudioBrainListItem
            key={p.id}
            title={p.name}
            subtitle={p.collection}
            isSelected={selectedId === p.id}
            onSelect={() => setSelectedId(p.id)}
          />
        ))}
      </div>
      {selectedProduct ? (
        <div className="space-y-4">
          {PRODUCT_KNOWLEDGE_FIELD_GROUPS.map((group) => (
            <div key={group.title}>
              <AdminStudioSectionHeading>{group.title}</AdminStudioSectionHeading>
              <div className="space-y-2 mt-2">
                {group.keys.map((key) => (
                  <AdminStudioEditableField
                    key={key}
                    label={PRODUCT_KNOWLEDGE_FIELD_LABELS[key]}
                    value={selectedProduct[key]}
                    onChange={(v) => updateProductField(selectedProduct.id, key, v)}
                    multiline
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function CtaLibrarySection() {
  const { filteredCtas, search, setSearch, selectedId, setSelectedId, selectedCta, updateCtaField } =
    useContentBrainCtas();

  return (
    <div className="space-y-3">
      <AdminStudioSectionHeading>CTA BLOCKS</AdminStudioSectionHeading>
      <AdminStudioSearchInput value={search} onChange={setSearch} placeholder="SEARCH CTAS..." />
      <div className="space-y-1 max-h-[100px] overflow-y-auto pr-1" style={{ scrollbarWidth: 'thin' }}>
        {filteredCtas.map((c) => (
          <AdminStudioBrainListItem
            key={c.id}
            title={c.title}
            subtitle={c.channel}
            isSelected={selectedId === c.id}
            onSelect={() => setSelectedId(c.id)}
          />
        ))}
      </div>
      {selectedCta ? (
        <div className="space-y-2">
          {(Object.keys(CTA_LIBRARY_FIELD_LABELS) as Array<keyof typeof CTA_LIBRARY_FIELD_LABELS>).map((key) => (
            <AdminStudioEditableField
              key={key}
              label={CTA_LIBRARY_FIELD_LABELS[key]}
              value={selectedCta[key]}
              onChange={(v) => updateCtaField(selectedCta.id, key, v)}
              multiline={key === 'body' || key === 'notes'}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ContentEngineSection() {
  const { fields, updateField } = useContentBrainEngine();
  return (
    <AdminStudioContentEngineWorkflow
      masterTopic={fields.masterTopic ?? ''}
      onMasterTopicChange={(v) => updateField('masterTopic', v)}
      workflowNotes={fields.workflowNotes ?? ''}
      onWorkflowNotesChange={(v) => updateField('workflowNotes', v)}
    />
  );
}

function ContentCalendarSection() {
  const { days, updateDayField } = useContentBrainCalendar();

  return (
    <div className="space-y-3">
      <AdminStudioSectionHeading>WEEKLY RHYTHM</AdminStudioSectionHeading>
      {days.map((day) => (
        <div
          key={day.id}
          className="p-3 space-y-2"
          style={{
            background: ADMIN_STUDIO_THEME.panelBg,
            border: `1px solid ${ADMIN_STUDIO_THEME.panelBorder}`,
            borderLeft: `2px solid ${ADMIN_STUDIO_THEME.accent}`,
          }}
        >
          <p
            className="text-[11px]"
            style={{
              fontFamily: '"Covered By Your Grace", "Covered By Your Grace Preload", sans-serif',
              color: ADMIN_STUDIO_THEME.accent,
            }}
          >
            {day.dayLabel}
          </p>
          <AdminStudioEditableField
            label="FOCUS"
            value={day.focus}
            onChange={(v) => updateDayField(day.id, 'focus', v)}
          />
          <AdminStudioEditableField
            label="TASKS"
            value={day.tasks}
            onChange={(v) => updateDayField(day.id, 'tasks', v)}
            multiline
          />
          <AdminStudioEditableField
            label="NOTES"
            value={day.notes}
            onChange={(v) => updateDayField(day.id, 'notes', v)}
            multiline
          />
        </div>
      ))}
    </div>
  );
}

function ApprovalRulesSection() {
  const { fields, updateField } = useContentBrainApproval();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {ADMIN_STUDIO_APPROVAL_STATUSES.map((status) => (
          <span
            key={status.id}
            className="text-[7px] font-futura uppercase px-2 py-1 border bg-white/70"
            style={{
              fontWeight: 515,
              color: status.color,
              borderColor: `${status.color}44`,
            }}
          >
            {status.label}
          </span>
        ))}
      </div>
      <p
        className="text-[8px] font-futura uppercase"
        style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary, lineHeight: 1.5 }}
      >
        NEVER ALLOW AUTOMATIC PUBLISHING — ALL AI OUTPUTS START AS DRAFT.
      </p>
      <AdminStudioBrainFieldGroups groups={ADMIN_STUDIO_APPROVAL_RULES_GROUPS} fields={fields} onUpdate={updateField} />
    </div>
  );
}
