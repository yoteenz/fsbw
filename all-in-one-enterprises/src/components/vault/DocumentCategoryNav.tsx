import { VAULT_TAXONOMY, type VaultTaxonomyGroup } from '../../vault/vaultTaxonomy';

type Props = {
  active: VaultTaxonomyGroup | 'all';
  onChange: (group: VaultTaxonomyGroup | 'all') => void;
};

const ALL: { group: 'all'; label: string } = { group: 'all', label: 'All Documents' };

export function DocumentCategoryNav({ active, onChange }: Props) {
  const items = [ALL, ...VAULT_TAXONOMY.map((t) => ({ group: t.group, label: t.label }))];

  return (
    <div className="aio-doc-vault-categories" role="tablist" aria-label="Document categories">
      {items.map((item) => (
        <button
          key={item.group}
          type="button"
          role="tab"
          aria-selected={active === item.group}
          className={active === item.group ? 'aio-doc-vault-categories__active' : ''}
          onClick={() => onChange(item.group)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
