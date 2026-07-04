import { useState } from 'react';
import { AdminStudioTabBar } from '../AdminStudioTabBar';
import {
  PhotographyBibleProvider,
  usePhotographySystem,
  DERIVATIVE_CROP_TEMPLATES,
  DERIVATIVE_SITE_BINDINGS,
  DERIVATIVE_SLOT_DEFINITIONS,
} from '../../../../studio-os/product-photography';
import { useAdminStudioProductPhotographyBible } from '../../../../hooks/useAdminStudioProductPhotographyBibleState';
import { useAdminStudioPhotographyDerivatives } from '../../../../hooks/useAdminStudioPhotographyDerivativesState';
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
