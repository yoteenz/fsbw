import { useState } from 'react';
import { AdminStudioTabBar } from '../AdminStudioTabBar';
import {
  PhotographyBibleProvider,
  usePhotographySystem,
  DERIVATIVE_CROP_TEMPLATES,
  DERIVATIVE_SITE_BINDINGS,
  DERIVATIVE_SLOT_DEFINITIONS,
  CREATIVE_DNA_VERSION_HISTORY,
  CREATIVE_DNA_FUTURE_UNIT_SLOTS,
} from '../../../../studio-os/product-photography';
import { useAdminStudioProductPhotographyBible } from '../../../../hooks/useAdminStudioProductPhotographyBibleState';
import { useAdminStudioPhotographyDerivatives } from '../../../../hooks/useAdminStudioPhotographyDerivativesState';
import { useAdminStudioPhotographyCreativeDna } from '../../../../hooks/useAdminStudioPhotographyCreativeDnaState';
import {
  getPhotographyTabBody,
  PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN,
  PHOTOGRAPHY_BIBLE_TABS,
  PHOTOGRAPHY_EXPORT_TEMPLATES,
  PHOTOGRAPHY_INHERITANCE_FIELDS,
  MEDIA_KIT_ASSET_SLOTS,
  PHOTOGRAPHY_VERSION_HISTORY,
  type PhotographyBibleTabId,
} from '../../../../utils/adminStudioProductPhotographyBibleDemo';
import { SignatureUnitCard } from './SignatureUnitCard';
import { PP_VISUAL, ppCaption, ppPanelStyle, ppSectionTitle } from './photographyBibleTheme';
import { buildMediaKitForUnit } from '../../../../studio-os/product-photography';
import type { SignatureCollectionUnitSlug } from '../../../../studio-os/product-photography';

function PhotographyBibleDashboardInner() {
  const [activeTab, setActiveTab] = useState<PhotographyBibleTabId>('overview');
  const { lockedSpecifications, currentVersion } = usePhotographySystem();
  const { units, approveUnit } = useAdminStudioProductPhotographyBible();
  const { getForUnit, results } = useAdminStudioPhotographyDerivatives();
  const { dna, generationPackagePreview } = useAdminStudioPhotographyCreativeDna();

  const tabBody = getPhotographyTabBody(activeTab);
  const preparedUnitCount = results.length;

  return (
    <div className="pb-6">
      <AdminStudioTabBar tabs={PHOTOGRAPHY_BIBLE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && (
        <>
          <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px', marginBottom: '12px' }}>
            <p style={{ ...ppCaption, color: PP_VISUAL.red }}>PHOTOGRAPHY SYSTEM {currentVersion.label.toUpperCase()}</p>
            <p style={ppCaption}>{tabBody}</p>
            <p style={{ ...ppSectionTitle, marginTop: 10 }}>LOCKED SPECIFICATIONS</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {lockedSpecifications.map((spec) => (
                <div key={spec.id} className="p-2" style={{ background: 'rgba(0,0,0,0.03)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                  <p style={{ ...ppCaption, fontSize: '6px' }}>{spec.label}</p>
                  <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"', fontSize: '9px' }}>
                    {spec.value}
                  </p>
                  <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red }}>LOCKED</p>
                </div>
              ))}
            </div>
          </section>

          <section style={{ ...ppPanelStyle, padding: '12px', marginBottom: '12px' }}>
            <p style={ppSectionTitle}>INHERITANCE CHAIN</p>
            <p style={ppCaption}>Every new StudioOS product inherits: {PHOTOGRAPHY_INHERITANCE_FIELDS.join(' · ')}</p>
            <div className="flex flex-col items-center gap-0 mt-2">
              {PHOTOGRAPHY_BIBLE_INHERITANCE_CHAIN.map((step, i) => (
                <div key={step} className="w-full flex flex-col items-center">
                  {i > 0 ? <div className="w-px h-2" style={{ background: PP_VISUAL.panelBorder }} /> : null}
                  <div
                    className="w-full px-2 py-1 text-center border"
                    style={{
                      ...ppCaption,
                      fontSize: '7px',
                      color: step.includes('BIBLE') ? PP_VISUAL.red : PP_VISUAL.muted,
                      background: 'rgba(255,255,255,0.7)',
                      borderColor: PP_VISUAL.panelBorder,
                    }}
                  >
                    {step}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}

      {(activeTab === 'display-mannequin' ||
        activeTab === 'camera-system' ||
        activeTab === 'composition' ||
        activeTab === 'lighting' ||
        activeTab === 'background' ||
        activeTab === 'color-science' ||
        activeTab === 'exports') && (
        <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={ppSectionTitle}>{PHOTOGRAPHY_BIBLE_TABS.find((t) => t.id === activeTab)?.label}</p>
          <p style={ppCaption}>{tabBody}</p>
          <p style={{ ...ppCaption, marginTop: 8, fontSize: '7px' }}>
            DOCS · docs/frontal-slayer/product-photography-bible/
          </p>
        </section>
      )}

      {activeTab === 'media-kits' && (
        <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={ppSectionTitle}>MEDIA KIT ARCHITECTURE</p>
          <p style={ppCaption}>{tabBody}</p>
          <ul style={{ margin: '10px 0 0', paddingLeft: '16px' }}>
            {MEDIA_KIT_ASSET_SLOTS.map((slot) => (
              <li key={slot.id} style={{ ...ppCaption, marginBottom: 4 }}>
                {slot.label} — {slot.description}
              </li>
            ))}
          </ul>
          <p style={{ ...ppCaption, marginTop: 10 }}>
            EXAMPLE · {buildMediaKitForUnit('noir' as SignatureCollectionUnitSlug)[0]?.folderPath}
          </p>
        </section>
      )}

      {activeTab === 'templates' && (
        <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={ppSectionTitle}>EXPORT TEMPLATES</p>
          <p style={ppCaption}>{tabBody}</p>
          <div className="grid grid-cols-1 gap-2 mt-3 sm:grid-cols-2">
            {PHOTOGRAPHY_EXPORT_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="p-2" style={{ background: 'rgba(0,0,0,0.03)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{tpl.label}</p>
                <p style={ppCaption}>
                  {tpl.width}×{tpl.height} · {tpl.format.toUpperCase()}
                </p>
                <p style={{ ...ppCaption, fontSize: '7px' }}>{tpl.notes}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'version-history' && (
        <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={ppSectionTitle}>VERSION LINEAGE</p>
          {PHOTOGRAPHY_VERSION_HISTORY.map((v) => (
            <div key={v.version} className="mb-3 p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
              <p style={{ ...ppCaption, color: PP_VISUAL.red }}>{v.label}</p>
              <p style={ppCaption}>{v.summary}</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>
                {v.effectiveDate} · {v.status.toUpperCase()} {v.immutable ? '· IMMUTABLE' : ''}
              </p>
            </div>
          ))}
          <p style={{ ...ppCaption, marginTop: 8 }}>FUTURE SLOTS · V1.1 · V1.2 · V2.0 (append-only)</p>
        </section>
      )}

      {activeTab === 'derivatives' && (
        <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={ppSectionTitle}>PHOTOGRAPHY DERIVATIVE ENGINE</p>
          <p style={ppCaption}>{tabBody}</p>
          <p style={{ ...ppCaption, marginTop: 8 }}>
            {DERIVATIVE_SLOT_DEFINITIONS.length} SLOTS · {DERIVATIVE_CROP_TEMPLATES.length} CROP TEMPLATES ·{' '}
            {DERIVATIVE_SITE_BINDINGS.length} SITE BINDINGS · {preparedUnitCount} UNITS PREPARED
          </p>
          <p style={{ ...ppCaption, marginTop: 6, fontSize: '7px' }}>
            DOCS · docs/frontal-slayer/photography-derivative-engine/
          </p>

          <p style={{ ...ppSectionTitle, marginTop: 14 }}>CROP TEMPLATE CATEGORIES</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mt-2">
            {(['wishlist', 'cart', 'search', 'collection', 'product', 'desktop', 'mobile', 'studio', 'email', 'social', 'thumbnail'] as const).map(
              (category) => {
                const templates = DERIVATIVE_CROP_TEMPLATES.filter((t) => t.category === category);
                return (
                  <div key={category} className="p-2" style={{ background: 'rgba(0,0,0,0.03)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                    <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"', textTransform: 'uppercase' }}>
                      {category}
                    </p>
                    <p style={{ ...ppCaption, fontSize: '7px' }}>{templates.map((t) => t.label).join(' · ') || '—'}</p>
                  </div>
                );
              }
            )}
          </div>

          <p style={{ ...ppSectionTitle, marginTop: 14 }}>DERIVATIVE SLOTS (ALL UNITS)</p>
          <ul style={{ margin: '8px 0 0', paddingLeft: '16px', maxHeight: 220, overflowY: 'auto' }}>
            {DERIVATIVE_SLOT_DEFINITIONS.map((slot) => (
              <li key={slot.id} style={{ ...ppCaption, marginBottom: 4 }}>
                {slot.name} — {slot.purpose}
              </li>
            ))}
          </ul>

          <p style={{ ...ppSectionTitle, marginTop: 14 }}>PREPARED DERIVATIVES BY UNIT</p>
          <p style={{ ...ppCaption, marginBottom: 8 }}>
            Approve a Signature unit below to auto-prepare {DERIVATIVE_SLOT_DEFINITIONS.length} derivative slots.
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {units.map((unit) => {
              const derivatives = getForUnit('signature-collection', unit.slug);
              const prepared = derivatives.length;
              return (
                <div key={unit.slug} className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
                  <p style={{ ...ppCaption, color: PP_VISUAL.red }}>
                    {unit.collectionNo} · {unit.label}
                  </p>
                  <p style={ppCaption}>
                    {prepared > 0
                      ? `${prepared} SLOTS PREPARED · STATUS ${derivatives[0]?.status?.toUpperCase() ?? '—'}`
                      : 'NOT PREPARED — APPROVE HERO TO PREPARE'}
                  </p>
                  {prepared > 0 ? (
                    <p style={{ ...ppCaption, fontSize: '7px' }}>{derivatives[0]?.folderPath.replace(/\/[^/]+$/, '/…')}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {activeTab === 'creative-dna' && (
        <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
          <p style={{ ...ppSectionTitle, color: PP_VISUAL.red }}>CREATIVE DNA {dna.version.toUpperCase()}</p>
          <p style={ppCaption}>{tabBody}</p>
          <p style={{ ...ppCaption, marginTop: 6, fontSize: '7px', color: PP_VISUAL.red }}>
            LOCK STATUS · {dna.lockStatus.toUpperCase()} · APPROVED / LOCKED
          </p>

          <p style={{ ...ppSectionTitle, marginTop: 14 }}>APPROVED PROMPT</p>
          <div className="p-2 mb-3" style={{ background: 'rgba(0,0,0,0.03)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
            <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{dna.approvedPrompt.name}</p>
            <p style={ppCaption}>
              PROMPT {dna.approvedPrompt.promptVersion.toUpperCase()} · CREATIVE DNA v{dna.approvedPrompt.creativeDnaVersion} ·{' '}
              {dna.approvedPrompt.status.toUpperCase()}
            </p>
            <pre
              style={{
                ...ppCaption,
                marginTop: 8,
                whiteSpace: 'pre-wrap',
                maxHeight: 220,
                overflowY: 'auto',
                fontSize: '7px',
                lineHeight: 1.45,
                color: PP_VISUAL.muted,
              }}
            >
              {dna.approvedPrompt.body}
            </pre>
          </div>

          <p style={ppSectionTitle}>EDITORIAL REFERENCE PROMPT</p>
          <pre
            className="p-2 mb-3"
            style={{
              ...ppCaption,
              whiteSpace: 'pre-wrap',
              background: 'rgba(255,255,255,0.7)',
              border: `1px solid ${PP_VISUAL.panelBorder}`,
              fontSize: '7px',
              lineHeight: 1.45,
            }}
          >
            {dna.editorialReferencePrompt}
          </pre>

          <p style={ppSectionTitle}>OFFICIAL DISPLAY BUST v{dna.displayBust.version}</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-3">
            <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
              <p style={{ ...ppCaption, color: PP_VISUAL.red }}>{dna.displayBust.label}</p>
              <p style={ppCaption}>CANONICAL · {dna.displayBust.canonicalFrontSrc}</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>PRESERVE · {dna.displayBust.preserve.join(' · ')}</p>
              <img
                src={dna.displayBust.canonicalFrontSrc}
                alt="Official Display Bust v1.0"
                className="mt-2 mx-auto"
                style={{ maxHeight: 120, objectFit: 'contain' }}
              />
            </div>
            <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(0,0,0,0.03)' }}>
              <p style={ppCaption}>TEXTURE FAMILIES (EXISTING SITE ASSETS)</p>
              {Object.entries(dna.displayBust.textureFamilies).map(([family, angles]) => (
                <p key={family} style={{ ...ppCaption, fontSize: '7px', marginTop: 4 }}>
                  {family.toUpperCase()} · {angles.front}
                </p>
              ))}
            </div>
          </div>

          <p style={ppSectionTitle}>APPROVED BENCHMARK OUTPUT — SOFT WAVE</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 mb-3">
            <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}` }}>
              <p style={{ ...ppCaption, color: PP_VISUAL.red }}>
                {dna.benchmarkOutput.collectionNumber} · {dna.benchmarkOutput.unit}
              </p>
              <p style={ppCaption}>
                {dna.benchmarkOutput.texture} · {dna.benchmarkOutput.length} · {dna.benchmarkOutput.density}
              </p>
              <p style={ppCaption}>{dna.benchmarkOutput.lace}</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>
                {dna.benchmarkOutput.aspectRatio} · {dna.benchmarkOutput.resolution} · {dna.benchmarkOutput.background} ·{' '}
                {dna.benchmarkOutput.status.toUpperCase()}
              </p>
            </div>
            <div className="p-2 flex items-center justify-center" style={{ border: `1px solid ${PP_VISUAL.panelBorder}` }}>
              <img
                src={dna.benchmarkOutput.heroPortraitSrc}
                alt="SOFT WAVE benchmark"
                style={{ maxHeight: 140, objectFit: 'contain' }}
              />
            </div>
          </div>

          <p style={ppSectionTitle}>LOCKED SPECIFICATIONS</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-3">
            {dna.lockedSpecifications.map((spec) => (
              <div key={spec.id} className="p-2" style={{ background: 'rgba(0,0,0,0.03)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                <p style={{ ...ppCaption, fontSize: '7px' }}>{spec.rule}</p>
                <p style={{ ...ppCaption, fontSize: '6px', color: PP_VISUAL.red }}>LOCKED</p>
              </div>
            ))}
          </div>

          <p style={ppSectionTitle}>GENERATION METADATA</p>
          <div className="p-2 mb-3" style={{ background: 'rgba(255,255,255,0.7)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
            <p style={ppCaption}>
              PER-UNIT VARIABLES ONLY · {dna.perUnitVariableFields.join(' · ')}
            </p>
            <p style={{ ...ppCaption, marginTop: 6, fontSize: '7px' }}>
              AUTO PACKAGE · Creative DNA + Approved Prompt + Display Bust + Editorial Reference + Product Reference + Unit Metadata
            </p>
            <p style={{ ...ppCaption, fontSize: '7px', marginTop: 4 }}>
              PREVIEW (SOFT WAVE) · bust {generationPackagePreview.displayBustFrontSrc} · product{' '}
              {generationPackagePreview.productReferenceImageSrc}
            </p>
          </div>

          <p style={ppSectionTitle}>FUTURE UNITS (PREPARED — NO GENERATION)</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 mb-3">
            {CREATIVE_DNA_FUTURE_UNIT_SLOTS.map((slot) => (
              <div key={slot.slug} className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                <p style={{ ...ppCaption, color: slot.status === 'benchmark' ? PP_VISUAL.red : PP_VISUAL.muted }}>
                  {slot.collectionNo} · {slot.label}
                </p>
                <p style={{ ...ppCaption, fontSize: '7px' }}>{slot.status.toUpperCase()} · {slot.inheritsFrom}</p>
              </div>
            ))}
          </div>

          <p style={ppSectionTitle}>VERSION HISTORY</p>
          {CREATIVE_DNA_VERSION_HISTORY.map((v) => (
            <div key={v.version} className="mb-2 p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
              <p style={{ ...ppCaption, color: PP_VISUAL.red }}>{v.label}</p>
              <p style={{ ...ppCaption, fontSize: '7px' }}>{v.summary}</p>
              <p style={{ ...ppCaption, fontSize: '6px' }}>
                {v.effectiveDate} · {v.status.toUpperCase()} {v.immutable ? '· IMMUTABLE' : ''}
              </p>
            </div>
          ))}
          <p style={{ ...ppCaption, marginTop: 6 }}>FUTURE SLOTS · v1.1 · v1.2 · v2.0 (append-only)</p>
          <p style={{ ...ppCaption, marginTop: 8, fontSize: '7px' }}>
            DOCS · docs/frontal-slayer/photography-creative-dna/
          </p>
        </section>
      )}

      <section style={{ marginTop: '16px' }}>
        <p style={ppSectionTitle}>SIGNATURE COLLECTION</p>
        <p style={{ ...ppCaption, marginBottom: 10 }}>6 FLAGSHIP UNITS · NO ASSETS GENERATED YET · ARCHITECTURE ONLY</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {units.map((unit) => (
            <SignatureUnitCard
              key={unit.slug}
              unit={unit}
              onApprove={() => approveUnit(unit.slug)}
              onReplace={() => window.alert('REPLACE — infrastructure only (Milestone 20.5). No upload pipeline yet.')}
              onView={() => window.open(unit.referenceImageSrc, '_blank', 'noopener,noreferrer')}
              onGenerateVariants={() =>
                window.alert('GENERATE VARIANTS — disabled in Milestone 20.5. No AI generation.')
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function PhotographyBibleWorkspace() {
  return (
    <PhotographyBibleProvider>
      <PhotographyBibleDashboardInner />
    </PhotographyBibleProvider>
  );
}
