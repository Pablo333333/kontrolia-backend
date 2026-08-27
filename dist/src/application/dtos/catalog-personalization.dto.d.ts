export declare class CreateCategoryDto {
    name: string;
    description?: string;
}
export declare class UpdateCategoryDto {
    name?: string;
    description?: string;
}
export declare class CreateSubcategoryDto {
    name: string;
    description?: string;
    categoryId: string;
}
export declare class UpdateSubcategoryDto {
    name?: string;
    description?: string;
}
export declare class UpdateTeamSettingsDto {
    displayName?: string;
    groupIdentifier?: string;
    logoUrl?: string;
    primaryColor?: string;
}
export declare class CreateDocumentFolderDto {
    name: string;
    description?: string;
}
export declare class UpdateUserPreferenceDto {
    defaultInboxView?: string;
    searchMode?: string;
    preferredCategoryIds?: string;
    notifyEmail?: boolean;
    notifyPush?: boolean;
    notifyWhatsApp?: boolean;
    accentColor?: string;
}
