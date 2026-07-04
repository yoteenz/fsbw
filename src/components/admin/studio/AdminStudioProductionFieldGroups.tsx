import { AdminStudioEditableField } from './AdminStudioEditableField';
import { AdminStudioSectionHeading } from './AdminStudioSectionHeading';
import type { ProductionFieldGroup, ProductionFieldKey, ProductionContentPack } from '../../../utils/adminStudioProductionDemo';

type AdminStudioProductionFieldGroupsProps = {
  groups: ProductionFieldGroup[];
  pack: ProductionContentPack;
  onUpdate: (key: ProductionFieldKey, value: string) => void;
};

export function AdminStudioProductionFieldGroups({ groups, pack, onUpdate }: AdminStudioProductionFieldGroupsProps) {
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
                value={pack[field.key] ?? ''}
                onChange={(v) => onUpdate(field.key, v)}
                multiline={field.multiline}
                accentHex={pack.accentHex}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
