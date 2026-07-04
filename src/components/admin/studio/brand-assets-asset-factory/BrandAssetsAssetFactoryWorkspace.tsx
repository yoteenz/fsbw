import { useMemo, useState } from 'react';
import { AdminStudioTabBar } from '../AdminStudioTabBar';
import {
  AdminStudioExpandableImage,
  AdminStudioImagePreviewModal,
  type AdminStudioImagePreviewItem,
} from '../AdminStudioImagePreviewModal';
import { useAdminStudioBrandAssetsProductAssetFactory } from '../../../../hooks/useAdminStudioBrandAssetsProductAssetFactoryState';
import { getPhotographyBibleUnit } from '../../../../hooks/useAdminStudioProductPhotographyBibleState';
import {
  ASSET_FACTORY_WORKFLOW,
  BRAND_ASSETS_ASSET_FACTORY_TABS,
  DERIVATIVE_BLOCKED_MESSAGE,
  FACTORY_CROP_TEMPLATES,
  FACTORY_POC_DERIVATIVE_OUTPUTS,
  getAssetFactoryTabBody,
  PRODUCT_ASSET_FACTORY_POC_UNIT,
  PRODUCT_ASSET_FACTORY_STAGES,
  productAssetFactoryStageLabel,
  productAssetSupabasePath,
  type BrandAssetsAssetFactoryTabId,
} from '../../../../utils/adminStudioBrandAssetsAssetFactoryDemo';
import { buildDerivativeGalleryItems } from '../../../../utils/assetFactoryDerivativeGallery';
import {
  AssetFactoryDerivativeGallery,
  AssetFactoryPreviewAllCropsModal,
  derivativeItemToPreview,
} from './AssetFactoryDerivativeGallery';
import { MasterHeroPreviewPanel } from './MasterHeroPreviewPanel';
import { PhotographyBiblePromptValidationPanel } from './PhotographyBiblePromptValidationPanel';
import { FinalPromptModal } from './FinalPromptModal';
import { resolveCanonicalGeneratedMasterSrc } from '../../../../studio-os/product-photography/ProductAssetFactory';
import {
  CREATIVE_DNA_BENCHMARK_OUTPUT,
  compileAndValidatePhotographyBiblePrompt,
} from '../../../../studio-os/product-photography';
import { PP_VISUAL, ppActionBtn, ppCaption, ppPanelStyle, ppSectionTitle, statusColor } from '../product-photography-bible/photographyBibleTheme';

function stageLabel(stage: string): string {
  return productAssetFactoryStageLabel(stage);
}

function isAwaitingHeroApproval(stage: string | undefined): boolean {
  return stage === 'awaiting-hero-approval' || stage === 'hero-generated';
}

function canApproveHero(job: { generatedMasterHeroUrl?: string; heroApproved?: boolean; stage?: string } | undefined): boolean {
  if (!job?.generatedMasterHeroUrl) return false;
  if (job.heroApproved) return false;
  if (job.stage === 'ready-for-review' || job.stage === 'published') return false;
  return isAwaitingHeroApproval(job.stage) || job.stage === 'failed';
}

export function BrandAssetsAssetFactoryWorkspace() {
  const [activeTab, setActiveTab] = useState<BrandAssetsAssetFactoryTabId>('overview');
  const [previewItem, setPreviewItem] = useState<AdminStudioImagePreviewItem | null>(null);
  const [previewAllOpen, setPreviewAllOpen] = useState(false);
  const [finalPromptOpen, setFinalPromptOpen] = useState(false);
  const {
    store,
    latestJob,
    running,
    lastError,
    generateMasterHero,
    approveHeroAndRunDerivatives,
    retryFromFailed,
    publishJob,
    approveRegistryAsset,
    regenerateDerivative,
  } = useAdminStudioBrandAssetsProductAssetFactory();

  const bibleUnit = getPhotographyBibleUnit(PRODUCT_ASSET_FACTORY_POC_UNIT.slug);
  const tabBody = getAssetFactoryTabBody(activeTab);
  const pocRegistry = store.registry.filter((r) => r.productSlug === PRODUCT_ASSET_FACTORY_POC_UNIT.slug);

  const productReferenceSrc =
    bibleUnit?.referenceImageSrc ?? PRODUCT_ASSET_FACTORY_POC_UNIT.productReferenceSrc;
  const generatedMasterSrc = resolveCanonicalGeneratedMasterSrc(latestJob);
  const masterHeroGeneration = latestJob?.masterHeroGeneration;

  const pocUnitVariables = useMemo(
    () => ({
      unitName: PRODUCT_ASSET_FACTORY_POC_UNIT.label,
      collectionNumber: PRODUCT_ASSET_FACTORY_POC_UNIT.collectionNumber,
      texture: CREATIVE_DNA_BENCHMARK_OUTPUT.texture,
      length: CREATIVE_DNA_BENCHMARK_OUTPUT.length,
      density: CREATIVE_DNA_BENCHMARK_OUTPUT.density,
      lace: CREATIVE_DNA_BENCHMARK_OUTPUT.lace,
    }),
    []
  );

  const promptCompilePreview = useMemo(() => {
    try {
      return compileAndValidatePhotographyBiblePrompt(pocUnitVariables);
    } catch {
      return null;
    }
  }, [pocUnitVariables]);

  const activePromptValidation =
    masterHeroGeneration?.promptValidation ?? promptCompilePreview?.validation;
  const activeFinalPrompt =
    masterHeroGeneration?.debugLog?.promptSent ?? promptCompilePreview?.compiledPrompt ?? '';

  const showDerivativeBlocked =
    !latestJob?.heroApproved &&
    !latestJob?.transparentMasterUrl &&
    latestJob?.stage !== 'ready-for-review' &&
    latestJob?.stage !== 'published';

  const galleryItems = useMemo(
    () =>
      buildDerivativeGalleryItems({
        registry: store.registry,
        productSlug: PRODUCT_ASSET_FACTORY_POC_UNIT.slug,
        version: PRODUCT_ASSET_FACTORY_POC_UNIT.version,
        job: latestJob,
      }),
    [store.registry, latestJob]
  );

  return (
    <div className="pb-6">
      <AdminStudioTabBar tabs={BRAND_ASSETS_ASSET_FACTORY_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px', marginBottom: '12px' }}>
        <p style={{ ...ppCaption, color: PP_VISUAL.red }}>POC · {PRODUCT_ASSET_FACTORY_POC_UNIT.label}</p>
        <p style={ppCaption}>
          COLLECTION {PRODUCT_ASSET_FACTORY_POC_UNIT.collectionNumber} · VERSION {PRODUCT_ASSET_FACTORY_POC_UNIT.version} ·
          BIBLE STATUS {bibleUnit?.photographyStatus?.toUpperCase() ?? 'REFERENCE'}
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 mt-2">
          <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
            <p style={{ ...ppCaption, fontSize: '6px' }}>PROCESSING STATUS</p>
            <p style={{ ...ppCaption, color: statusColor(latestJob?.stage ?? 'reference-ready'), fontFamily: '"Futura PT Medium"' }}>
              {stageLabel(latestJob?.stage ?? 'reference-ready').toUpperCase()}
            </p>
          </div>
          <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
            <p style={{ ...ppCaption, fontSize: '6px' }}>HERO APPROVED</p>
            <p style={{ ...ppCaption, color: latestJob?.heroApproved ? '#16a34a' : PP_VISUAL.muted, fontFamily: '"Futura PT Medium"' }}>
              {latestJob?.heroApproved ? 'YES' : 'NO'}
            </p>
          </div>
          <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
            <p style={{ ...ppCaption, fontSize: '6px' }}>SMART ASSETS</p>
            <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{latestJob?.derivativeCount ?? 0}</p>
          </div>
          <div className="p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
            <p style={{ ...ppCaption, fontSize: '6px' }}>REGISTRY</p>
            <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{pocRegistry.length}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            type="button"
            style={{ ...ppActionBtn, opacity: running ? 0.6 : 1, color: PP_VISUAL.red }}
            disabled={running}
            onClick={() => generateMasterHero(productReferenceSrc)}
          >
            {running ? 'PROCESSING…' : 'GENERATE MASTER HERO PORTRAIT'}
          </button>
          {canApproveHero(latestJob) || isAwaitingHeroApproval(latestJob?.stage) ? (
            <button
              type="button"
              style={ppActionBtn}
              disabled={running || !generatedMasterSrc}
              onClick={() => approveHeroAndRunDerivatives()}
            >
              APPROVE HERO & RUN DERIVATIVES
            </button>
          ) : null}
          {latestJob?.stage === 'failed' && latestJob.failedStage ? (
            <button
              type="button"
              style={ppActionBtn}
              disabled={running || !latestJob.heroApproved}
              onClick={() => retryFromFailed(latestJob.failedStage!)}
            >
              RETRY FROM {stageLabel(latestJob.failedStage).toUpperCase()}
            </button>
          ) : null}
          {latestJob?.stage === 'ready-for-review' ? (
            <button type="button" style={ppActionBtn} onClick={() => publishJob(latestJob.id)}>
              MARK PUBLISHED
            </button>
          ) : null}
        </div>
        {showDerivativeBlocked && !generatedMasterSrc ? (
          <p style={{ ...ppCaption, color: PP_VISUAL.red, marginTop: 8 }}>{DERIVATIVE_BLOCKED_MESSAGE}</p>
        ) : null}
        {lastError ? <p style={{ ...ppCaption, color: PP_VISUAL.red, marginTop: 8 }}>{lastError}</p> : null}
        {latestJob?.error ? <p style={{ ...ppCaption, color: PP_VISUAL.red, marginTop: 4 }}>{latestJob.error}</p> : null}

        <PhotographyBiblePromptValidationPanel
          validation={activePromptValidation}
          onViewFinalPrompt={() => setFinalPromptOpen(true)}
        />
      </section>

      {activeTab === 'overview' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>WORKFLOW</p>
          <p style={ppCaption}>{tabBody}</p>
          <div className="flex flex-col items-center gap-0 mt-2">
            {ASSET_FACTORY_WORKFLOW.map((step, i) => (
              <div key={step} className="w-full flex flex-col items-center">
                {i > 0 ? <div className="w-px h-2" style={{ background: PP_VISUAL.panelBorder }} /> : null}
                <div className="w-full px-2 py-1 text-center border" style={{ ...ppCaption, fontSize: '7px', borderColor: PP_VISUAL.panelBorder, background: 'rgba(255,255,255,0.7)' }}>
                  {step}
                </div>
              </div>
            ))}
          </div>
          <p style={{ ...ppCaption, marginTop: 10 }}>
            PRODUCT REFERENCE (INPUT ONLY) · {productReferenceSrc}
          </p>
        </section>
      )}

      {activeTab === 'processing-queue' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>PROCESSING QUEUE</p>
          <p style={ppCaption}>{tabBody}</p>
          {store.jobs.length === 0 ? (
            <p style={{ ...ppCaption, marginTop: 8 }}>NO JOBS — GENERATE MASTER HERO PORTRAIT TO BEGIN</p>
          ) : (
            store.jobs.map((job) => (
              <div key={job.id} className="mb-2 p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}`, background: 'rgba(255,255,255,0.7)' }}>
                <p style={{ ...ppCaption, color: PP_VISUAL.red }}>{job.productLabel} · {job.id.slice(0, 20)}…</p>
                <p style={ppCaption}>STAGE · {stageLabel(job.stage).toUpperCase()}</p>
                <p style={ppCaption}>HERO APPROVED · {job.heroApproved ? 'YES' : 'NO'}</p>
                <p style={{ ...ppCaption, fontSize: '7px' }}>{job.startedAt} · SMART ASSETS {job.derivativeCount}</p>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'derivative-engine' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>SMART ASSET OUTPUTS</p>
          <p style={ppCaption}>{tabBody}</p>
          {!latestJob?.heroApproved ? (
            <p style={{ ...ppCaption, color: PP_VISUAL.red, marginTop: 8 }}>{DERIVATIVE_BLOCKED_MESSAGE}</p>
          ) : null}
          <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
            {FACTORY_POC_DERIVATIVE_OUTPUTS.map((d) => (
              <li key={d.assetType} style={{ ...ppCaption, marginBottom: 4 }}>
                {d.assetType.toUpperCase()} → {d.templateId} → {d.fileName}
              </li>
            ))}
          </ul>
        </section>
      )}

      {activeTab === 'crop-templates' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>CROP TEMPLATES</p>
          <p style={ppCaption}>{tabBody}</p>
          <div className="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2">
            {FACTORY_CROP_TEMPLATES.map((t) => (
              <div key={t.id} className="p-2" style={{ background: 'rgba(0,0,0,0.03)', border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                <p style={{ ...ppCaption, color: PP_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{t.label}</p>
                <p style={ppCaption}>
                  {t.outputWidth}×{t.outputHeight} · {t.aspectRatio} · {t.exportFormat.toUpperCase()}
                </p>
                <p style={{ ...ppCaption, fontSize: '7px' }}>
                  ANCHOR {t.cropAnchor} · PAD {t.padding} · SCALE {t.scale} · {t.transparency ? 'ALPHA' : 'OPAQUE'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === 'asset-registry' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>ASSET REGISTRY</p>
          <p style={ppCaption}>{tabBody}</p>
          {pocRegistry.length === 0 ? (
            <p style={{ ...ppCaption, marginTop: 8 }}>EMPTY — APPROVE HERO & RUN DERIVATIVES TO REGISTER ASSETS</p>
          ) : (
            pocRegistry.map((r) => (
              <div key={r.id} className="mb-2 p-2" style={{ border: `1px solid ${PP_VISUAL.panelBorder}` }}>
                <p style={{ ...ppCaption, color: PP_VISUAL.red }}>{r.assetType.toUpperCase()} · {r.status.toUpperCase()}</p>
                <p style={ppCaption}>
                  {r.dimensions.width}×{r.dimensions.height} · {r.cropTemplateId}
                </p>
                <p style={{ ...ppCaption, fontSize: '7px', wordBreak: 'break-all' }}>{r.supabaseUrl || r.storagePath}</p>
              </div>
            ))
          )}
        </section>
      )}

      {activeTab === 'production-log' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>PRODUCTION LOG</p>
          <p style={ppCaption}>{tabBody}</p>
          <div style={{ maxHeight: 280, overflowY: 'auto', marginTop: 8 }}>
            {store.logs.length === 0 ? (
              <p style={ppCaption}>NO LOG ENTRIES</p>
            ) : (
              store.logs.map((log) => (
                <p key={log.id} style={{ ...ppCaption, color: log.level === 'error' ? PP_VISUAL.red : PP_VISUAL.muted, marginBottom: 4, fontSize: '7px' }}>
                  [{stageLabel(log.stage).toUpperCase()}] {log.message}
                </p>
              ))
            )}
          </div>
        </section>
      )}

      {activeTab === 'settings' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>SETTINGS</p>
          <p style={ppCaption}>{tabBody}</p>
          <ul style={{ margin: '8px 0 0', paddingLeft: '16px' }}>
            <li style={{ ...ppCaption, marginBottom: 4 }}>POC UNIT LOCKED · SOFT WAVE ONLY</li>
            <li style={{ ...ppCaption, marginBottom: 4 }}>BUCKET · products/signature-collection/…</li>
            <li style={{ ...ppCaption, marginBottom: 4 }}>EXAMPLE · {productAssetSupabasePath('soft-wave', 'v1', 'cart.png')}</li>
            <li style={{ ...ppCaption, marginBottom: 4 }}>STAGES · {PRODUCT_ASSET_FACTORY_STAGES.join(' → ')}</li>
          </ul>
        </section>
      )}

      {activeTab === 'documentation' && (
        <section style={{ ...ppPanelStyle, padding: '12px' }}>
          <p style={ppSectionTitle}>DOCUMENTATION</p>
          <p style={ppCaption}>{tabBody}</p>
          <p style={{ ...ppCaption, marginTop: 8 }}>docs/frontal-slayer/asset-factory/</p>
        </section>
      )}

      <section style={{ ...ppPanelStyle, padding: '12px', marginTop: '12px' }}>
        <p style={ppSectionTitle}>MASTER PREVIEW</p>
        <p style={{ ...ppCaption, marginBottom: 8 }}>
          1 · PRODUCT REFERENCE (WEBSITE INPUT) · 2 · GENERATED MASTER HERO · 3 · TRANSPARENT MASTER (POST-APPROVAL)
        </p>
        <div className="flex gap-3 flex-wrap items-start">
          <AdminStudioExpandableImage
            src={productReferenceSrc}
            alt="Product reference"
            label="PRODUCT REFERENCE"
            subtitle={`${PRODUCT_ASSET_FACTORY_POC_UNIT.label} · WEBSITE INPUT ONLY`}
            onExpand={setPreviewItem}
          />
          {generatedMasterSrc ? (
            <AdminStudioExpandableImage
              src={generatedMasterSrc}
              alt="Generated master hero"
              label="GENERATED MASTER HERO"
              subtitle="CREATIVE DNA v1.0 · FAL OUTPUT"
              onExpand={setPreviewItem}
            />
          ) : (
            <div className="p-2" style={{ border: `1px dashed ${PP_VISUAL.panelBorder}`, minWidth: 120 }}>
              <p style={{ ...ppCaption, fontSize: '7px' }}>GENERATED MASTER HERO</p>
              <p style={{ ...ppCaption, color: PP_VISUAL.muted, fontSize: '6px' }}>NOT YET GENERATED</p>
            </div>
          )}
          {latestJob?.transparentMasterUrl ? (
            <AdminStudioExpandableImage
              src={latestJob.transparentMasterUrl}
              alt="Transparent master"
              label="TRANSPARENT MASTER"
              subtitle="FROM APPROVED GENERATED HERO · IDEOGRAM"
              checkerboard
              onExpand={setPreviewItem}
            />
          ) : (
            <div className="p-2" style={{ border: `1px dashed ${PP_VISUAL.panelBorder}`, minWidth: 120 }}>
              <p style={{ ...ppCaption, fontSize: '7px' }}>TRANSPARENT MASTER</p>
              <p style={{ ...ppCaption, color: PP_VISUAL.muted, fontSize: '6px' }}>REQUIRES HERO APPROVAL</p>
            </div>
          )}
        </div>

        <MasterHeroPreviewPanel
          generatedMasterSrc={generatedMasterSrc}
          generation={masterHeroGeneration}
          running={running}
          onExpand={setPreviewItem}
          onRegenerate={() => generateMasterHero(productReferenceSrc)}
          onViewFinalPrompt={() => setFinalPromptOpen(true)}
        />
      </section>

      <AssetFactoryDerivativeGallery
        items={galleryItems}
        productLabel={PRODUCT_ASSET_FACTORY_POC_UNIT.label}
        running={running}
        onView={(item) => item.previewSrc && setPreviewItem(derivativeItemToPreview(item))}
        onRegenerate={(assetType) => void regenerateDerivative(assetType)}
        onApprove={approveRegistryAsset}
        onPreviewAll={() => setPreviewAllOpen(true)}
      />

      <AdminStudioImagePreviewModal item={previewItem} onClose={() => setPreviewItem(null)} />
      <FinalPromptModal
        open={finalPromptOpen}
        onClose={() => setFinalPromptOpen(false)}
        variables={masterHeroGeneration?.promptValidation?.injectedVariables ?? pocUnitVariables}
        finalPrompt={activeFinalPrompt}
        validation={activePromptValidation}
      />
      {previewAllOpen ? (
        <AssetFactoryPreviewAllCropsModal
          items={galleryItems}
          productLabel={PRODUCT_ASSET_FACTORY_POC_UNIT.label}
          onClose={() => setPreviewAllOpen(false)}
          onView={(item) => {
            setPreviewAllOpen(false);
            if (item.previewSrc) setPreviewItem(derivativeItemToPreview(item));
          }}
        />
      ) : null}
    </div>
  );
}
