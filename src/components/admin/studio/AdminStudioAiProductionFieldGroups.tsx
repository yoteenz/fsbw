import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { AiProductionFieldGroup, AiProductionFieldKey, AiProductionRun } from '../../../utils/adminStudioAiProductionEngineDemo';

type AdminStudioAiProductionFieldGroupsProps = {
  groups: AiProductionFieldGroup[];
  run: AiProductionRun;
  onUpdate: (key: AiProductionFieldKey, value: string) => void;
};

export function AdminStudioAiProductionFieldGroups({ groups, run, onUpdate }: AdminStudioAiProductionFieldGroupsProps) {
  return (
    <div className="space-y-5">
      {groups.map((group) => (
        <div key={group.title}>
          <AdminStudioSectionHeading>{group.title}</AdminStudioSectionHeading>
          <div className="space-y-2 mt-2">
            {group.fields.map((field) => (
              <AdminStudioEditableField
                key={field.key}
                label={field.label}
                value={run[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
                accentHex={run.accentHex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
