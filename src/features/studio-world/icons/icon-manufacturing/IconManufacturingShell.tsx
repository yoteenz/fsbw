import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type {
  IconSheetProfileId,
  IconSheetProfile,
  IconManufacturingCellQaReport,
  IconManufacturingHistoryEvent,
  IconManufacturingVersionEntry,
} from '../../../../studio-os-core/icon-manufacturing';
import {
  buildBatchExportPlan,
  executeBatchExportPlan,
  buildProductionPromotionPlan,
  promoteCertifiedCategoryToProduction,
  CERTIFICATION_PIPELINE,
  listManufacturingHistoryForSheet,
  listVersionsForSheet,
  loadCertificationRecords,
  RUNTIME_PREVIEW_CONTEXTS,
  RUNTIME_PREVIEW_SIZES,
  setIconCertificationStage,
} from '../../../../studio-os-core/icon-manufacturing';
import { listNavigationMasterDraftIconDefinitions } from '../navigation-master/navigation-master-icon-draft-bridge';
import { ensureStudioWorldIconSystemBridge } from '../studio-world-icon-system-bridge';
import type { StudioWorldIconDefinition } from '../../../../studio-os-core/studio-world-icon-system';
import { searchIcons } from '../../../../studio-os-core/studio-world-icon-system';
import { GridCalibrationStudio } from './GridCalibrationStudio';
import {
  getCanonicalCalibrationForProfile,
  loadCalibrationDraftForProfile,
  runQaForProfile,
  useIconManufacturingSheet,
} from './useIconManufacturingSheet';
import './icon-manufacturing.css';

type ManufacturingSection =
  | 'library'
  | 'calibration'
  | 'qa'
  | 'export'
  | 'certification'
  | 'registry'
  | 'health'
  | 'history'
  | 'promotion'
  | 'preview';

const SECTIONS: Array<{ id: ManufacturingSection; label: string }> = [
  { id: 'library', label: 'Master Library' },
  { id: 'calibration', label: 'Calibration Studio' },
  { id: 'qa', label: 'Quality Assurance' },
  { id: 'export', label: 'Batch Export' },
  { id: 'certification', label: 'Certification' },
  { id: 'registry', label: 'Registry' },
  { id: 'health', label: 'Icon Health' },
  { id: 'history', label: 'Manufacturing History' },
  { id: 'promotion', label: 'Production Promotion' },
  { id: 'preview', label: 'Runtime Preview' },
];

export function IconManufacturingShell() {
  const [section, setSection] = useState<ManufacturingSection>('library');
  const [activeSheetId, setActiveSheetId] = useState<IconSheetProfileId>('navigation-master');
  const [searchQuery, setSearchQuery] = useState('');
  const [founderApproved, setFounderApproved] = useState(false);
  const [exportInstructions, setExportInstructions] = useState<string[]>([]);

  const { profile, allProfiles, registry } = useIconManufacturingSheet(activeSheetId);
  const calibration = useMemo(
    () => loadCalibrationDraftForProfile(activeSheetId) ?? getCanonicalCalibrationForProfile(activeSheetId),
    [activeSheetId],
  );
  const qaReport = useMemo(() => runQaForProfile(activeSheetId, calibration), [activeSheetId, calibration]);

  const draftDefinitions = useMemo(() => {
    if (activeSheetId === 'navigation-master') return listNavigationMasterDraftIconDefinitions();
    ensureStudioWorldIconSystemBridge();
    return [];
  }, [activeSheetId]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchIcons({ query: searchQuery, category: profile.category });
  }, [searchQuery, profile.category]);

  const certificationRecords = loadCertificationRecords();
  const history = listManufacturingHistoryForSheet(activeSheetId);
  const versions = listVersionsForSheet(activeSheetId);

  const handleBatchExport = () => {
    const plan = buildBatchExportPlan(profile, qaReport, draftDefinitions);
    const result = executeBatchExportPlan(profile, plan);
    setExportInstructions(result.instructions);
    setSection('export');
  };

  const handlePromote = () => {
    promoteCertifiedCategoryToProduction(profile, draftDefinitions, founderApproved);
  };

  return (
    <div className="icon-mfg">
      <header className="icon-mfg__header">
        <div>
          <h1 className="icon-mfg__title">Studio World Icon Manufacturing</h1>
          <p className="icon-mfg__meta" style={{ margin: '4px 0 0' }}>
            Master Sheet → Calibration → QA → Certification → Registry → Production
          </p>
        </div>
        <Link to="/admin/studio/studio-world-icon-grid-calibration" className="icon-mfg__meta">
          Legacy EL calibration route (preserved)
        </Link>
      </header>

      <nav className="icon-mfg__nav" style={{ padding: '0 20px 12px' }} aria-label="Manufacturing sections">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`icon-mfg__tab${section === s.id ? ' icon-mfg__tab--active' : ''}`}
            onClick={() => setSection(s.id)}
          >
            {s.label}
          </button>
        ))}
      </nav>

      <div className="icon-mfg__body">
        {section === 'library' && (
          <div className="icon-mfg__grid">
            {allProfiles.map((sheet: IconSheetProfile) => (
              <article key={sheet.id} className="icon-mfg__card">
                <h3>{sheet.label}</h3>
                <p className="icon-mfg__meta">Category: {sheet.category}</p>
                <p className="icon-mfg__meta">Grid: {sheet.grid.rows}×{sheet.grid.columns} · {sheet.grid.iconCount} icons</p>
                <p className="icon-mfg__meta">Resolution: {sheet.sourceWidth}×{sheet.sourceHeight}</p>
                <p className="icon-mfg__meta">Version: {sheet.version} · {sheet.certification}</p>
                <p className="icon-mfg__meta">Status: {sheet.runtimeStatus}</p>
                <button type="button" className="icon-mfg__btn icon-mfg__btn--primary" onClick={() => { setActiveSheetId(sheet.id); setSection('calibration'); }}>
                  Open Calibration Studio
                </button>
              </article>
            ))}
          </div>
        )}

        {section === 'calibration' && (
          <div>
            <p className="icon-mfg__meta" style={{ marginBottom: 12 }}>
              Active sheet: <strong>{profile.label}</strong>
              {' · '}
              <button type="button" className="icon-mfg__btn" onClick={() => setActiveSheetId(activeSheetId === 'experience-lab' ? 'navigation-master' : 'experience-lab')}>
                Switch sheet
              </button>
            </p>
            <GridCalibrationStudio profileId={activeSheetId} />
          </div>
        )}

        {section === 'qa' && (
          <div className="icon-mfg__split">
            <div className="icon-mfg__card">
              <h3>QA Summary — {profile.label}</h3>
              <p><span className="icon-mfg__badge icon-mfg__badge--pass">PASS {qaReport.pass}</span>
                <span className="icon-mfg__badge icon-mfg__badge--warn">WARN {qaReport.warn}</span>
                <span className="icon-mfg__badge icon-mfg__badge--fail">FAIL {qaReport.fail}</span></p>
              <ul className="icon-mfg__list">
                {qaReport.cells.filter((c: IconManufacturingCellQaReport) => c.overall !== 'pass').slice(0, 40).map((c: IconManufacturingCellQaReport) => (
                  <li key={`${c.row}-${c.column}`}>
                    {c.iconId} r{c.row + 1}c{c.column + 1} — <span className={`icon-mfg__badge icon-mfg__badge--${c.overall === 'fail' ? 'fail' : 'warn'}`}>{c.overall}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="icon-mfg__card">
              <h3>Checks per icon</h3>
              <p className="icon-mfg__meta">Centered · Safe Area · Transparency · Clipping · Glow · Optical Balance · Aspect · Duplicate · Empty · Metadata · Resolution · Certification</p>
            </div>
          </div>
        )}

        {section === 'export' && (
          <div className="icon-mfg__card">
            <h3>Batch Export — {profile.label}</h3>
            <p className="icon-mfg__meta">Pipeline: Master Sheet → Slice → Optimize → PNG → Metadata → Manifest → QA → Certification Ready</p>
            <p className="icon-mfg__meta">Build: <code>{profile.buildScript}</code></p>
            <button type="button" className="icon-mfg__btn icon-mfg__btn--primary" onClick={handleBatchExport}>Export Category</button>
            {exportInstructions.length > 0 && (
              <pre className="icon-mfg__instructions">{exportInstructions.join('\n')}</pre>
            )}
          </div>
        )}

        {section === 'certification' && (
          <div className="icon-mfg__card">
            <h3>Certification Lifecycle</h3>
            <p className="icon-mfg__meta">{CERTIFICATION_PIPELINE.join(' → ')}</p>
            <p className="icon-mfg__meta">Only Certified icons enter runtime. Founder approval required.</p>
            {draftDefinitions.slice(0, 12).map((d) => (
              <div key={d.id} style={{ marginBottom: 8 }}>
                <span>{d.displayName}</span>
                {' '}
                <button type="button" className="icon-mfg__btn" onClick={() => setIconCertificationStage(d.id, 'qa')}>QA</button>
                <button type="button" className="icon-mfg__btn" onClick={() => setIconCertificationStage(d.id, 'founder-approved')}>Approve</button>
                <button type="button" className="icon-mfg__btn" onClick={() => setIconCertificationStage(d.id, 'certified')}>Certify</button>
                <span className="icon-mfg__meta"> ({certificationRecords[d.id]?.stage ?? 'draft'})</span>
              </div>
            ))}
          </div>
        )}

        {section === 'registry' && (
          <div className="icon-mfg__card">
            <h3>Icon Registry Search</h3>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search category, keyword, alias…" style={{ width: '100%', marginBottom: 8, padding: 8, background: '#111', border: '1px solid #333', color: '#eee' }} />
            <ul className="icon-mfg__list">
              {searchResults.slice(0, 30).map((r: StudioWorldIconDefinition) => (
                <li key={r.id}>{r.displayName} — {r.category} — {r.certification}</li>
              ))}
            </ul>
            <p className="icon-mfg__meta">{Object.keys(registry).length} icons in active sheet registry</p>
          </div>
        )}

        {section === 'health' && (
          <div className="icon-mfg__card">
            <h3>Icon Health</h3>
            <ul>
              <li>Total icons: {profile.grid.iconCount}</li>
              <li>QA Pass: {qaReport.pass}</li>
              <li>Warnings: {qaReport.warn}</li>
              <li>Failures: {qaReport.fail}</li>
              <li>Coverage: {Math.round((qaReport.pass / qaReport.totalCells) * 100)}%</li>
              <li>Certification stage: {profile.certification}</li>
            </ul>
          </div>
        )}

        {section === 'history' && (
          <div className="icon-mfg__card">
            <h3>Manufacturing History</h3>
            <ul className="icon-mfg__list">
              {history.map((e: IconManufacturingHistoryEvent) => (
                <li key={e.id}>{e.timestamp} — {e.type}: {e.summary}</li>
              ))}
              {versions.map((v: IconManufacturingVersionEntry) => (
                <li key={v.id}>v{v.revision} — {v.notes} ({v.author})</li>
              ))}
            </ul>
          </div>
        )}

        {section === 'promotion' && (
          <div className="icon-mfg__card">
            <h3>Production Promotion</h3>
            <p className="icon-mfg__meta">{buildProductionPromotionPlan(profile, draftDefinitions, founderApproved).steps.join(' → ')}</p>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <input type="checkbox" checked={founderApproved} onChange={(e) => setFounderApproved(e.target.checked)} />
              Founder approval confirmed
            </label>
            <button type="button" className="icon-mfg__btn icon-mfg__btn--primary" onClick={handlePromote} disabled={!founderApproved}>
              Promote Certified Category
            </button>
            <p className="icon-mfg__meta">Does not auto-swap Experience Lab runtime — registry metadata only until deploy.</p>
          </div>
        )}

        {section === 'preview' && (
          <div className="icon-mfg__card">
            <h3>Runtime Preview (architecture)</h3>
            <p className="icon-mfg__meta">Contexts: {RUNTIME_PREVIEW_CONTEXTS.join(', ')}</p>
            <p className="icon-mfg__meta">Sizes: {RUNTIME_PREVIEW_SIZES.join(', ')}px</p>
            <p className="icon-mfg__meta">Themes: studio-dark, studio-light, high-contrast · States: default, hover, selected, disabled</p>
            <p className="icon-mfg__meta">Preview only — no runtime UI changes.</p>
          </div>
        )}
      </div>
    </div>
  );
}
