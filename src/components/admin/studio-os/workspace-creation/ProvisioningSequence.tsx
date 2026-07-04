import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  WORKSPACE_PROVISIONING_STEPS,
  runProvisioningSequence,
  type ProvisioningStep,
} from '../../../../studio-os-core/workspace-creation';
import { STUDIO_OS_UPPERCASE_CLASS } from '../../../../utils/adminStudioTheme';
import { ADMIN_STUDIO_THEME } from '../../../../utils/adminStudioTheme';

type ProvisioningSequenceProps = {
  open: boolean;
  workspaceName: string;
  onComplete: () => void;
};

export function ProvisioningSequence({ open, workspaceName, onComplete }: ProvisioningSequenceProps) {
  const [activeStep, setActiveStep] = useState<ProvisioningStep | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    setCompleted([]);
    setActiveStep(WORKSPACE_PROVISIONING_STEPS[0]);
    let cancelled = false;

    void runProvisioningSequence((step, index) => {
      if (cancelled) return;
      setActiveStep(step);
      setCompleted(WORKSPACE_PROVISIONING_STEPS.slice(0, index).map((s) => s.id));
    }).then(() => {
      if (cancelled) return;
      setCompleted(WORKSPACE_PROVISIONING_STEPS.map((s) => s.id));
      setTimeout(onComplete, 400);
    });

    return () => {
      cancelled = true;
    };
  }, [open, onComplete]);

  if (!open || typeof document === 'undefined') return null;

  return createPortal(
    <div
      className={`fixed inset-0 flex items-center justify-center p-4 ${STUDIO_OS_UPPERCASE_CLASS}`}
      style={{ zIndex: 10002, background: 'rgba(0,0,0,0.72)' }}
    >
      <div
        className="bg-white border w-full max-w-md p-4 shadow-2xl"
        style={{ borderWidth: '1.3px', borderColor: ADMIN_STUDIO_THEME.panelBorder }}
      >
        <p
          className="text-[12px] mb-1"
          style={{ fontFamily: '"Covered By Your Grace", sans-serif', color: '#EB1C24' }}
        >
          PROVISIONING {workspaceName.toUpperCase()}
        </p>
        <p className="text-[7px] font-futura mb-4" style={{ fontWeight: 515, color: ADMIN_STUDIO_THEME.textSecondary }}>
          STUDIO OS IS INCORPORATING A NEW COMPANY
        </p>

        <div className="space-y-1 max-h-[50vh] overflow-y-auto">
          {WORKSPACE_PROVISIONING_STEPS.map((step) => {
            const done = completed.includes(step.id);
            const active = activeStep?.id === step.id;
            return (
              <div
                key={step.id}
                className="flex items-center gap-2 px-2 py-1.5 border"
                style={{
                  borderColor: active ? '#6366F1' : ADMIN_STUDIO_THEME.panelBorder,
                  background: active ? 'rgba(99,102,241,0.08)' : done ? 'rgba(16,185,129,0.06)' : 'rgba(255,255,255,0.8)',
                }}
              >
                <span className="text-[8px] w-4">{done ? '✓' : active ? '▸' : '·'}</span>
                <span
                  className="text-[7px] font-futura flex-1"
                  style={{
                    fontWeight: 515,
                    color: done ? '#16a34a' : active ? '#6366F1' : ADMIN_STUDIO_THEME.textSecondary,
                  }}
                >
                  {step.label.toUpperCase()}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body
  );
}
