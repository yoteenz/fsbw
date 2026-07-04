import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { AudienceFieldGroup, AudienceInsightFieldKey, AudienceInsightRecord } from '../../../utils/adminStudioAudienceBrainDemo';

type AdminStudioAudienceFieldGroupsProps = {
  groups: AudienceFieldGroup[];
  insight: AudienceInsightRecord;
  onUpdate: (key: AudienceInsightFieldKey, value: string) => void;
  accentHex?: string;
};

export function AdminStudioAudienceFieldGroups({ groups, insight, onUpdate, accentHex = '#EB1C24' }: AdminStudioAudienceFieldGroupsProps) {
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
                value={insight[field.key] ?? ''}
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
