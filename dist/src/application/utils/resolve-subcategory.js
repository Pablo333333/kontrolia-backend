"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveSubcategoryId = resolveSubcategoryId;
exports.composeCategoryTitle = composeCategoryTitle;
const MESSAGE_TYPE_PATTERNS = {
    COORDINACION: [/coordin/i, /chat/i],
    DOCUMENTOS_TECNICOS: [/tecnic/i, /obra/i, /ingenier/i],
    CONVENIOS: [/convenio/i, /acuerdo/i],
    TRAMITE: [/tramite/i, /document/i],
};
const TRAMITE_SUBTYPE_PATTERNS = {
    CARTA: [/carta/i],
    OFICIO: [/oficio/i],
    SOLICITUD: [/solic/i],
};
function matchesAny(text, patterns) {
    return patterns.some((pattern) => pattern.test(text));
}
function resolveSubcategoryId(params) {
    const { subcategories, title, messageType, tramiteSubtype, explicitId } = params;
    if (!subcategories.length)
        return undefined;
    if (explicitId && subcategories.some((s) => s.id === explicitId)) {
        return explicitId;
    }
    const searchable = (s) => `${s.name} ${s.description ?? ''}`;
    if (tramiteSubtype) {
        const patterns = TRAMITE_SUBTYPE_PATTERNS[tramiteSubtype.toUpperCase()];
        if (patterns) {
            const bySubtype = subcategories.find((s) => matchesAny(searchable(s), patterns));
            if (bySubtype)
                return bySubtype.id;
        }
    }
    if (messageType) {
        const patterns = MESSAGE_TYPE_PATTERNS[messageType.toUpperCase()];
        if (patterns) {
            const byType = subcategories.find((s) => matchesAny(searchable(s), patterns));
            if (byType)
                return byType.id;
        }
    }
    if (title?.trim()) {
        const titleLower = title.trim().toLowerCase();
        const byTitle = subcategories.find((s) => {
            const name = s.name.toLowerCase();
            return titleLower.includes(name) || name.includes(titleLower);
        });
        if (byTitle)
            return byTitle.id;
    }
    return subcategories[0]?.id;
}
function composeCategoryTitle(categoryName, subcategoryName, userTitle) {
    const base = subcategoryName
        ? `${categoryName} — ${subcategoryName}`
        : categoryName;
    const trimmed = userTitle?.trim();
    if (!trimmed)
        return base;
    const alreadyHasCategory = trimmed.toLowerCase().includes(categoryName.toLowerCase());
    if (alreadyHasCategory)
        return trimmed;
    return `${base}: ${trimmed}`;
}
//# sourceMappingURL=resolve-subcategory.js.map