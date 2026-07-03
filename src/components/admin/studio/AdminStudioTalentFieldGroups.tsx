import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { TalentFieldGroup, TalentFieldKey, TalentAgencyEntry } from '../../../utils/adminStudioTalentAgencyDemo';

type AdminStudioTalentFieldGroupsProps = {
  groups: TalentFieldGroup[];
  talent: TalentAgencyEntry;
  onUpdate: (key: TalentFieldKey, value: string) => void;
};

export function AdminStudioTalentFieldGroups({ groups, talent, onUpdate }: AdminStudioTalentFieldGroupsProps) {
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
                value={talent[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
                accentHex={talent.accentHex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
