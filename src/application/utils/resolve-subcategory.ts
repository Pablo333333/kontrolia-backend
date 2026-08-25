type SubcategoryLike = {
  id: string;
  name: string;
  description?: string | null;
};

const MESSAGE_TYPE_PATTERNS: Record<string, RegExp[]> = {
  COORDINACION: [/coordin/i, /chat/i],
  DOCUMENTOS_TECNICOS: [/tecnic/i, /obra/i, /ingenier/i],
  CONVENIOS: [/convenio/i, /acuerdo/i],
  TRAMITE: [/tramite/i, /document/i],
};

const TRAMITE_SUBTYPE_PATTERNS: Record<string, RegExp[]> = {
  CARTA: [/carta/i],
  OFICIO: [/oficio/i],
  SOLICITUD: [/solic/i],
};

function matchesAny(text: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(text));
}

/**
 * Resuelve la subcategoría predefinida según tipo de mensaje, subtítulo de trámite
 * o coincidencia por título contra el catálogo del grupo.
 */
export function resolveSubcategoryId(params: {
  subcategories: SubcategoryLike[];
  title?: string | null;
  messageType?: string | null;
  tramiteSubtype?: string | null;
  explicitId?: string | null;
}): string | undefined {
  const { subcategories, title, messageType, tramiteSubtype, explicitId } = params;
  if (!subcategories.length) return undefined;

  if (explicitId && subcategories.some((s) => s.id === explicitId)) {
    return explicitId;
  }

  const searchable = (s: SubcategoryLike) => `${s.name} ${s.description ?? ''}`;

  if (tramiteSubtype) {
    const patterns = TRAMITE_SUBTYPE_PATTERNS[tramiteSubtype.toUpperCase()];
    if (patterns) {
      const bySubtype = subcategories.find((s) => matchesAny(searchable(s), patterns));
      if (bySubtype) return bySubtype.id;
    }
  }

  if (messageType) {
    const patterns = MESSAGE_TYPE_PATTERNS[messageType.toUpperCase()];
    if (patterns) {
      const byType = subcategories.find((s) => matchesAny(searchable(s), patterns));
      if (byType) return byType.id;
    }
  }

  if (title?.trim()) {
    const titleLower = title.trim().toLowerCase();
    const byTitle = subcategories.find((s) => {
      const name = s.name.toLowerCase();
      return titleLower.includes(name) || name.includes(titleLower);
    });
    if (byTitle) return byTitle.id;
  }

  return subcategories[0]?.id;
}

export function composeCategoryTitle(
  categoryName: string,
  subcategoryName?: string | null,
  userTitle?: string | null,
): string {
  const base = subcategoryName
    ? `${categoryName} — ${subcategoryName}`
    : categoryName;

  const trimmed = userTitle?.trim();
  if (!trimmed) return base;

  // Si el usuario ya escribió algo distinto al auto-título, lo preservamos
  // anteponiendo categoría/subcategoría solo si no están incluidas.
  const alreadyHasCategory = trimmed.toLowerCase().includes(categoryName.toLowerCase());
  if (alreadyHasCategory) return trimmed;

  return `${base}: ${trimmed}`;
}
