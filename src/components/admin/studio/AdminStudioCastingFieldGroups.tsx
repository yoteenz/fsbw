import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';

type AdminStudioCastingFieldGroupsProps = {
  groups: Array<{ title: string; fields: Array<{ key: string; label: string; multiline?: boolean }> }>;
  values: Record<string, string>;
  onUpdate: (key: string, value: string) => void;
  accentHex: string;
};

export function AdminStudioCastingFieldGroups({ groups, values, onUpdate, accentHex }: AdminStudioCastingFieldGroupsProps) {
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
                value={values[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
                accentHex={accentHex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
