import {
  CANONICAL_OBJECT_FAMILIES,
  CANONICAL_OBJECT_TYPES,
  COMPOSITION_PATTERNS,
  INHERITANCE_FAMILIES,
  type CanonicalObjectTypeId,
} from '../constants';

export type CanonicalObjectTypeMeta = {
  id: CanonicalObjectTypeId;
  label: string;
  family: keyof typeof CANONICAL_OBJECT_FAMILIES;
  description: string;
  allowsInheritance: boolean;
  compositionChildren: CanonicalObjectTypeId[];
};

function familyForType(type: CanonicalObjectTypeId): keyof typeof CANONICAL_OBJECT_FAMILIES {
  for (const [family, types] of Object.entries(CANONICAL_OBJECT_FAMILIES)) {
    if ((types as readonly string[]).includes(type)) {
      return family as keyof typeof CANONICAL_OBJECT_FAMILIES;
    }
  }
  return 'kernel';
}

function labelFromId(id: CanonicalObjectTypeId): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
    .replace(/\bAi\b/g, 'AI')
    .replace(/\bAdr\b/g, 'ADR')
    .concat('™');
}

/** Object Types™ — canonical ontology type registry */
export function listCanonicalObjectTypes(): CanonicalObjectTypeMeta[] {
  return CANONICAL_OBJECT_TYPES.map((id) => ({
    id,
    label: labelFromId(id),
    family: familyForType(id),
    description: `Canonical ${labelFromId(id)} object type from Genesis Sprint 3 ontology.`,
    allowsInheritance: Object.keys(INHERITANCE_FAMILIES).some((parent) =>
      INHERITANCE_FAMILIES[parent as CanonicalObjectTypeId]?.includes(id)
    ),
    compositionChildren: COMPOSITION_PATTERNS[id] ?? [],
  }));
}

export function getCanonicalObjectTypeMeta(
  typeId: CanonicalObjectTypeId
): CanonicalObjectTypeMeta | undefined {
  return listCanonicalObjectTypes().find((t) => t.id === typeId);
}

export function isCanonicalObjectType(value: string): value is CanonicalObjectTypeId {
  return (CANONICAL_OBJECT_TYPES as readonly string[]).includes(value);
}

export function listObjectTypesByFamily(
  family: keyof typeof CANONICAL_OBJECT_FAMILIES
): CanonicalObjectTypeMeta[] {
  return listCanonicalObjectTypes().filter((t) => t.family === family);
}

export function listInheritanceParents(): CanonicalObjectTypeId[] {
  return Object.keys(INHERITANCE_FAMILIES) as CanonicalObjectTypeId[];
}

export function listInheritanceChildren(
  parentType: CanonicalObjectTypeId
): CanonicalObjectTypeId[] {
  return INHERITANCE_FAMILIES[parentType] ?? [];
}

export function listCompositionPatterns(): Partial<
  Record<CanonicalObjectTypeId, CanonicalObjectTypeId[]>
> {
  return { ...COMPOSITION_PATTERNS };
}
