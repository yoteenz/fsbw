import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { DistributionFieldGroup } from '../../../utils/adminStudioDistributionNetworkDemo';

type AdminStudioDistributionFieldGroupsProps<T extends string, R extends Record<T, string>> = {
  groups: DistributionFieldGroup<T>[];
  record: R;
  onUpdate: (key: T, value: string) => void;
  accentHex?: string;
};

export function AdminStudioDistributionFieldGroups<T extends string, R extends Record<T, string>>({
  groups,
  record,
  onUpdate,
  accentHex = '#EB1C24',
}: AdminStudioDistributionFieldGroupsProps<T, R>) {
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
                value={record[field.key] ?? ''}
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
