type SubcategoryLike = {
    id: string;
    name: string;
    description?: string | null;
};
export declare function resolveSubcategoryId(params: {
    subcategories: SubcategoryLike[];
    title?: string | null;
    messageType?: string | null;
    tramiteSubtype?: string | null;
    explicitId?: string | null;
}): string | undefined;
export declare function composeCategoryTitle(categoryName: string, subcategoryName?: string | null, userTitle?: string | null): string;
export {};
