import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { StudioLotFieldGroup, StudioLotFieldKey, StudioLotEntry } from '../../../utils/adminStudioStudioLotDemo';

type AdminStudioLotFieldGroupsProps = {
  groups: StudioLotFieldGroup[];
  studio: StudioLotEntry;
  onUpdate: (key: StudioLotFieldKey, value: string) => void;
};

export function AdminStudioLotFieldGroups({ groups, studio, onUpdate }: AdminStudioLotFieldGroupsProps) {
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
                value={studio[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
                accentHex={studio.accentHex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
