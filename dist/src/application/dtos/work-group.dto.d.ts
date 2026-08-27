export declare class CreateWorkGroupDto {
    name: string;
    identifier: string;
    description?: string;
    logoUrl?: string;
    primaryColor?: string;
}
export declare class UpdateWorkGroupDto {
    name?: string;
    description?: string;
    logoUrl?: string;
    primaryColor?: string;
    isActive?: boolean;
}
export declare class AddWorkGroupMemberDto {
    userId: string;
    roleInGroup?: string;
}
export declare class AssignWorkGroupTopicsDto {
    categoryIds: string[];
}
export declare class SetActiveWorkGroupDto {
    workGroupId: string;
}
export declare class UpdateUserContactDto {
    phone?: string;
}
