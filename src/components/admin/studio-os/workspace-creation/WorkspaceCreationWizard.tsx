import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BlueprintDefinition, WorkspaceCreationDraft, WorkspaceType } from '../../../../studio-os-core/workspace-creation/types';
import { getBlueprintById } from '../../../../studio-os-core/workspace-creation/blueprints';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';
import { adminStudioOrganizationalInheritancePath } from '../../../../utils/adminStudioRoutes';
import { WORKSPACE_DASHBOARD_MODULE_LABELS } from '../../../../utils/adminStudioWorkspaceCreationDemo';

const STEPS = [
  'Select Blueprint',
  'Workspace Information',
  'Workspace Type',
  'Review Modules',
  'Branding',
  'Launch Workspace',
] as const;

type WorkspaceCreationWizardProps = {
  blueprints: BlueprintDefinition[];
  onLaunch: (draft: WorkspaceCreationDraft) => void;
  initialBlueprintId?: string;
};

const inputStyle = {
  fontWeight: 515,
  fontSize: '7px',
  borderColor: ADMIN_STUDIO_THEME.panelBorder,
} as const;

export function WorkspaceCreationWizard({
  blueprints,
  onLaunch,
  initialBlueprintId,
}: WorkspaceCreationWizardProps) {
  const [step, setStep] = useState(0);
  const [blueprintId, setBlueprintId] = useState(initialBlueprintId ?? '');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoSrc, setLogoSrc] = useState('/assets/marble-half.png');
  const [icon, setIcon] = useState('');
  const [coverImage, setCoverImage] = useState('/assets/marble-half.png');
  const [accentColor, setAccentColor] = useState('#6366F1');
  const [workspaceType, setWorkspaceType] = useState<WorkspaceType>('pilot');
  const [enabledOptional, setEnabledOptional] = useState<string[]>([]);
  const [theme, setTheme] = useState('studio-os-glass');
  const [typography, setTypography] = useState('Futura PT');
  const [primaryColor, setPrimaryColor] = useState('#6366F1');
  const [secondaryColor, setSecondaryColor] = useState('#808080');
  const [glassStyle, setGlassStyle] = useState('marble-white-60-blur');
  const [buttonStyle, setButtonStyle] = useState('futura-uppercase-red');
  const [panelStyle, setPanelStyle] = useState('white-60-border-black');

  const blueprint = useMemo(() => getBlueprintById(blueprintId), [blueprintId]);

  const selectBlueprint = (id: string) => {
    setBlueprintId(id);
    const bp = getBlueprintById(id);
    if (bp) {
      setAccentColor(bp.defaultAccentColor);
      setPrimaryColor(bp.defaultAccentColor);
      setIcon(bp.icon);
      setEnabledOptional(bp.optionalModules.slice(0, Math.min(4, bp.optionalModules.length)));
    }
  };

  const toggleOptional = (moduleId: string) => {
    setEnabledOptional((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const draft: WorkspaceCreationDraft = {
    blueprintId,
    name,
    description,
    logoSrc,
    icon: icon || blueprint?.icon || '⬜',
    coverImage,
    accentColor,
    workspaceType,
    enabledOptionalModules: enabledOptional as WorkspaceCreationDraft['enabledOptionalModules'],
    branding: {
      theme,
      typography,
      primaryColor,
      secondaryColor,
      glassStyle,
      buttonStyle,
      panelStyle,
    },
  };

  const canNext =
    step === 0
      ? Boolean(blueprintId)
      : step === 1
        ? name.trim().length >= 2 && description.trim().length >= 8
        : true;

  return (
    <div
      className="border p-3"
      style={{ borderColor: ADMIN_STUDIO_THEME.panelBorder, background: 'rgba(255,255,255,0.85)' }}
    >
      <p className="text-[8px] font-futura mb-2" style={{ fontWeight: 515, color: '#6366F1' }}>
        STEP {step + 1} · {STEPS[step].toUpperCase()}
      </p>

      {step === 0 ? (
        <>
          <div className="p-2 mb-2 border" style={{ borderColor: '#6366F1', background: 'rgba(99,102,241,0.06)' }}>
            <p className="text-[7px] font-futura mb-1" style={{ fontWeight: 515, color: '#6366F1' }}>
              ORGANIZATIONAL INHERITANCE · BEFORE BLANK SETUP
            </p>
            <p className="text-[6px] font-futura mb-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
              NEW COMPANIES CAN INHERIT DNA · PLAYBOOKS · EXECUTIVES · KNOWLEDGE FROM EXISTING ORGANIZATIONS
            </p>
            <Link
              to={adminStudioOrganizationalInheritancePath()}
              className="inline-block text-[6px] font-futura border px-2 py-1"
              style={{ fontWeight: 515, color: '#6366F1', borderColor: '#6366F1' }}
            >
              OPEN INHERITANCE WIZARD →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {blueprints.map((bp) => (
            <button
              key={bp.id}
              type="button"
              onClick={() => selectBlueprint(bp.id)}
              className="text-left p-2 border"
              style={{
                borderColor: blueprintId === bp.id ? '#6366F1' : ADMIN_STUDIO_THEME.panelBorder,
                background: blueprintId === bp.id ? 'rgba(99,102,241,0.08)' : 'white',
              }}
            >
              <p className="text-[10px]">{bp.icon}</p>
              <p className="text-[8px] font-futura mt-1" style={{ fontWeight: 515 }}>
                {bp.name.toUpperCase()}
              </p>
              <p className="text-[6px] font-futura mt-1" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {bp.description}
              </p>
            </button>
          ))}
        </div>
        </>
      ) : null}

      {step === 1 ? (
        <div className="space-y-2">
          <input className="w-full border p-2 font-futura uppercase" style={inputStyle} placeholder="WORKSPACE NAME" value={name} onChange={(e) => setName(e.target.value)} />
          <textarea className="w-full border p-2 font-futura uppercase min-h-[72px]" style={inputStyle} placeholder="DESCRIPTION" value={description} onChange={(e) => setDescription(e.target.value)} />
          <input className="w-full border p-2 font-futura uppercase" style={inputStyle} placeholder="LOGO SRC" value={logoSrc} onChange={(e) => setLogoSrc(e.target.value)} />
          <input className="w-full border p-2 font-futura uppercase" style={inputStyle} placeholder="ICON" value={icon} onChange={(e) => setIcon(e.target.value)} />
          <input className="w-full border p-2 font-futura uppercase" style={inputStyle} placeholder="COVER IMAGE" value={coverImage} onChange={(e) => setCoverImage(e.target.value)} />
          <input className="w-full border p-2 font-futura uppercase" type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)} />
        </div>
      ) : null}

      {step === 2 ? (
        <div className="flex flex-wrap gap-2">
          {(['production', 'pilot', 'internal'] as WorkspaceType[]).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setWorkspaceType(type)}
              className="px-3 py-2 border text-[7px] font-futura"
              style={{
                fontWeight: 515,
                borderColor: workspaceType === type ? '#6366F1' : ADMIN_STUDIO_THEME.panelBorder,
                background: workspaceType === type ? 'rgba(99,102,241,0.1)' : 'white',
              }}
            >
              {type.toUpperCase()}
            </button>
          ))}
        </div>
      ) : null}

      {step === 3 && blueprint ? (
        <div className="space-y-2">
          <p className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            REQUIRED MODULES · LOCKED
          </p>
          <div className="flex flex-wrap gap-1">
            {blueprint.requiredModules.map((m) => (
              <span key={m} className="text-[6px] font-futura px-1 py-0.5 border" style={{ borderColor: '#16a34a', color: '#16a34a' }}>
                {WORKSPACE_DASHBOARD_MODULE_LABELS[m]?.toUpperCase() ?? m}
              </span>
            ))}
          </div>
          <p className="text-[6px] font-futura mt-2" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
            OPTIONAL MODULES
          </p>
          <div className="flex flex-wrap gap-1">
            {blueprint.optionalModules.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleOptional(m)}
                className="text-[6px] font-futura px-1 py-0.5 border"
                style={{
                  borderColor: enabledOptional.includes(m) ? '#6366F1' : ADMIN_STUDIO_THEME.panelBorder,
                  color: enabledOptional.includes(m) ? '#6366F1' : ADMIN_STUDIO_THEME.textSecondary,
                }}
              >
                {WORKSPACE_DASHBOARD_MODULE_LABELS[m]?.toUpperCase() ?? m}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {[
            ['Theme', theme, setTheme],
            ['Typography', typography, setTypography],
            ['Primary Color', primaryColor, setPrimaryColor],
            ['Secondary Color', secondaryColor, setSecondaryColor],
            ['Glass Style', glassStyle, setGlassStyle],
            ['Button Style', buttonStyle, setButtonStyle],
            ['Panel Style', panelStyle, setPanelStyle],
          ].map(([label, val, setter]) => (
            <label key={String(label)} className="block">
              <span className="text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
                {String(label).toUpperCase()}
              </span>
              <input
                className="w-full border p-2 font-futura uppercase mt-0.5"
                style={inputStyle}
                value={String(val)}
                onChange={(e) => (setter as (v: string) => void)(e.target.value)}
              />
            </label>
          ))}
        </div>
      ) : null}

      {step === 5 ? (
        <div className="space-y-1 text-[6px] font-futura" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          <p>BLUEPRINT · {blueprint?.name.toUpperCase()}</p>
          <p>NAME · {name.toUpperCase()}</p>
          <p>TYPE · {workspaceType.toUpperCase()}</p>
          <p>MODULES · {blueprint ? blueprint.requiredModules.length + enabledOptional.length : 0}</p>
          <p>EXECUTIVE TEAM · {blueprint?.executiveRoleIds.length ?? 0} ROLES</p>
          <p className="text-[#6366F1] mt-2">READY TO LAUNCH · PROVISIONING SEQUENCE WILL BEGIN</p>
        </div>
      ) : null}

      <div className="flex gap-2 mt-4">
        {step > 0 ? (
          <button type="button" className="px-3 py-2 text-[7px] font-futura border" style={{ fontWeight: 515, borderColor: ADMIN_STUDIO_THEME.panelBorder }} onClick={() => setStep((s) => s - 1)}>
            BACK
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            disabled={!canNext}
            className="px-3 py-2 text-[7px] font-futura border"
            style={{ fontWeight: 515, color: '#FFF', background: canNext ? '#6366F1' : '#9CA3AF', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            onClick={() => setStep((s) => s + 1)}
          >
            NEXT
          </button>
        ) : (
          <button
            type="button"
            className="px-3 py-2 text-[7px] font-futura border"
            style={{ fontWeight: 515, color: '#FFF', background: '#6366F1', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
            onClick={() => onLaunch(draft)}
          >
            LAUNCH WORKSPACE
          </button>
        )}
      </div>
    </div>
  );
}
