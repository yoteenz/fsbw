import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { ShowBibleFieldGroup, ShowBibleFieldKey, ShowBibleEntry } from '../../../utils/adminStudioShowBibleDemo';

type AdminStudioShowBibleFieldGroupsProps = {
  groups: ShowBibleFieldGroup[];
  show: ShowBibleEntry;
  onUpdate: (key: ShowBibleFieldKey, value: string) => void;
};

export function AdminStudioShowBibleFieldGroups({ groups, show, onUpdate }: AdminStudioShowBibleFieldGroupsProps) {
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
                value={show[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
                accentHex={show.accentHex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
