import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { ContentBrainFieldGroup, ContentBrainFieldRecord } from '../../../utils/adminStudioContentBrainDemo';

type AdminStudioBrainFieldGroupsProps = {
  groups: ContentBrainFieldGroup[];
  fields: ContentBrainFieldRecord;
  onUpdate: (key: string, value: string) => void;
};

export function AdminStudioBrainFieldGroups({ groups, fields, onUpdate }: AdminStudioBrainFieldGroupsProps) {
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
                value={fields[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
