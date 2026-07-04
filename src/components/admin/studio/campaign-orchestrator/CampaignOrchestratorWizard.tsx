import type { CampaignWizardDraft, CampaignWizardStep } from '../../../../utils/adminStudioCampaignOrchestratorDemo';
import {
  CAMPAIGN_AUDIENCES,
  CAMPAIGN_COLLECTIONS,
  CAMPAIGN_PRODUCTS,
  CAMPAIGN_REGIONS,
  CAMPAIGN_SHOWS,
  CAMPAIGN_STUDIOS,
  CAMPAIGN_TALENT,
  CAMPAIGN_TYPES,
} from '../../../../utils/adminStudioCampaignOrchestratorDemo';
import { CO_VISUAL, coActionBtn, coCaption, coInputStyle, coPanelStyle, coSectionTitle } from './campaignOrchestratorTheme';

type CampaignOrchestratorWizardProps = {
  wizard: CampaignWizardDraft;
  onUpdate: (patch: Partial<CampaignWizardDraft>) => void;
  onStep: (step: CampaignWizardStep) => void;
  onGenerate: () => void;
  onCancel: () => void;
};

const STEPS: CampaignWizardStep[] = [1, 2, 3, 4, 5];

export function CampaignOrchestratorWizard({ wizard, onUpdate, onStep, onGenerate, onCancel }: CampaignOrchestratorWizardProps) {
  return (
    <div style={{ ...coPanelStyle, padding: '16px' }}>
      <div className="flex gap-2 mb-4 overflow-x-auto">
        {STEPS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onStep(s)}
            style={{
              ...coActionBtn,
              borderColor: wizard.step === s ? CO_VISUAL.red : '#000',
              background: wizard.step === s ? '#FFF5F5' : '#fff',
            }}
          >
            STEP {s}
          </button>
        ))}
      </div>

      {wizard.step === 1 && (
        <div className="space-y-3">
          <p style={coSectionTitle}>CAMPAIGN IDENTITY</p>
          <Field label="CAMPAIGN NAME" value={wizard.name} onChange={(v) => onUpdate({ name: v })} />
          <label style={coCaption}>
            CAMPAIGN TYPE
            <select
              value={wizard.typeId}
              onChange={(e) => onUpdate({ typeId: e.target.value as CampaignWizardDraft['typeId'] })}
              className="w-full mt-1 border"
              style={coInputStyle}
            >
              {CAMPAIGN_TYPES.map((t) => (
                <option key={t.id} value={t.id}>{t.label}</option>
              ))}
            </select>
          </label>
          <Field label="WORKSPACE" value={wizard.workspace} onChange={(v) => onUpdate({ workspace: v })} />
          <Field label="BRAND" value={wizard.brand} onChange={(v) => onUpdate({ brand: v })} />
          <label style={coCaption}>
            GOALS
            <textarea value={wizard.goals} onChange={(e) => onUpdate({ goals: e.target.value })} className="w-full mt-1 border min-h-[60px]" style={coInputStyle} placeholder="LAUNCH NOIR NEXT MONTH…" />
          </label>
        </div>
      )}

      {wizard.step === 2 && (
        <div className="space-y-3">
          <p style={coSectionTitle}>AUDIENCE & OFFER</p>
          <ChipGroup label="PRODUCTS" options={[...CAMPAIGN_PRODUCTS]} selected={wizard.products} onChange={(products) => onUpdate({ products })} />
          <ChipGroup label="COLLECTIONS" options={[...CAMPAIGN_COLLECTIONS]} selected={wizard.collections} onChange={(collections) => onUpdate({ collections })} />
          <label style={coCaption}>
            AUDIENCE
            <select value={wizard.audience} onChange={(e) => onUpdate({ audience: e.target.value })} className="w-full mt-1 border" style={coInputStyle}>
              {CAMPAIGN_AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </label>
          <ChipGroup label="REGIONS" options={[...CAMPAIGN_REGIONS]} selected={wizard.regions} onChange={(regions) => onUpdate({ regions })} />
        </div>
      )}

      {wizard.step === 3 && (
        <div className="space-y-3">
          <p style={coSectionTitle}>SCHEDULE & PRIORITY</p>
          <Field label="LAUNCH DATE" value={wizard.launchDate} onChange={(v) => onUpdate({ launchDate: v })} type="date" />
          <label style={coCaption}>
            CAMPAIGN LENGTH (WEEKS)
            <input type="number" min={2} max={12} value={wizard.lengthWeeks} onChange={(e) => onUpdate({ lengthWeeks: Number(e.target.value) })} className="w-full mt-1 border" style={coInputStyle} />
          </label>
          <label style={coCaption}>
            PRIORITY
            <select value={wizard.priority} onChange={(e) => onUpdate({ priority: e.target.value as CampaignWizardDraft['priority'] })} className="w-full mt-1 border" style={coInputStyle}>
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>
          </label>
          <Field label="BUDGET PLACEHOLDER" value={wizard.budgetPlaceholder} onChange={(v) => onUpdate({ budgetPlaceholder: v })} />
          <Field label="CAMPAIGN THEME" value={wizard.theme} onChange={(v) => onUpdate({ theme: v })} />
          <label style={coCaption}>
            RECURRENCE
            <select value={wizard.recurrence} onChange={(e) => onUpdate({ recurrence: e.target.value as CampaignWizardDraft['recurrence'] })} className="w-full mt-1 border" style={coInputStyle}>
              <option value="none">ONE-TIME</option>
              <option value="weekly">WEEKLY</option>
              <option value="monthly">MONTHLY</option>
              <option value="quarterly">QUARTERLY</option>
              <option value="annual">ANNUAL</option>
            </select>
          </label>
        </div>
      )}

      {wizard.step === 4 && (
        <div className="space-y-3">
          <p style={coSectionTitle}>CREATIVE DIRECTION</p>
          <ChipGroup label="SHOWS" options={[...CAMPAIGN_SHOWS]} selected={wizard.shows} onChange={(shows) => onUpdate({ shows })} />
          <ChipGroup label="STUDIOS" options={[...CAMPAIGN_STUDIOS]} selected={wizard.studios} onChange={(studios) => onUpdate({ studios })} />
          <ChipGroup label="TALENT" options={[...CAMPAIGN_TALENT]} selected={wizard.talent} onChange={(talent) => onUpdate({ talent })} />
        </div>
      )}

      {wizard.step === 5 && (
        <div>
          <p style={coSectionTitle}>GENERATE EXECUTION PLAN</p>
          <p style={{ ...coCaption, marginBottom: '12px' }}>
            STUDIO OS WILL BUILD TIMELINE · TASKS · DELIVERABLES · DEPENDENCIES · EXECUTIVE REVIEW
          </p>
          <div style={{ ...coPanelStyle, padding: '10px', marginBottom: '12px', background: '#fff' }}>
            <p style={{ ...coCaption, color: CO_VISUAL.black, fontFamily: '"Futura PT Medium"' }}>{wizard.name || 'UNTITLED'} · {CAMPAIGN_TYPES.find((t) => t.id === wizard.typeId)?.label}</p>
            <p style={coCaption}>LAUNCH {wizard.launchDate} · {wizard.lengthWeeks} WEEKS · {wizard.products.join(', ') || 'NO PRODUCTS'}</p>
          </div>
          <button type="button" onClick={onGenerate} style={{ ...coActionBtn, fontSize: '10px', width: '100%' }}>
            GENERATE CAMPAIGN PLAN
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <button type="button" onClick={onCancel} style={coActionBtn}>CANCEL</button>
        {wizard.step < 5 ? (
          <button type="button" onClick={() => onStep((wizard.step + 1) as CampaignWizardStep)} style={coActionBtn}>NEXT</button>
        ) : null}
        {wizard.step > 1 ? (
          <button type="button" onClick={() => onStep((wizard.step - 1) as CampaignWizardStep)} style={coActionBtn}>BACK</button>
        ) : null}
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <label style={coCaption}>
      {label}
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full mt-1 border" style={coInputStyle} />
    </label>
  );
}

function ChipGroup({ label, options, selected, onChange }: { label: string; options: string[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <p style={{ ...coCaption, marginBottom: '4px' }}>{label}</p>
      <div className="flex flex-wrap gap-1">
        {options.map((opt) => {
          const on = selected.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(on ? selected.filter((x) => x !== opt) : [...selected, opt])}
              style={{
                fontSize: '7px',
                fontFamily: '"Futura PT Medium"',
                padding: '4px 6px',
                border: on ? `1.3px solid ${CO_VISUAL.red}` : CO_VISUAL.border,
                background: on ? '#FFF5F5' : '#fff',
                cursor: 'pointer',
              }}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
