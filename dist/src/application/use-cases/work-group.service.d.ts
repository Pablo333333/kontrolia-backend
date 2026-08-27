import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { CreateWorkGroupDto, UpdateWorkGroupDto, AddWorkGroupMemberDto, AssignWorkGroupTopicsDto } from '../dtos/work-group.dto';
export declare class WorkGroupService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listForUser(userId: string, role: string): Promise<({
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    })[]>;
    findById(id: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }>;
    create(dto: CreateWorkGroupDto, creatorUserId: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }>;
    update(id: string, dto: UpdateWorkGroupDto): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }>;
    addMember(workGroupId: string, dto: AddWorkGroupMemberDto): Promise<{
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
            phone: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        roleInGroup: string;
        userId: string;
        workGroupId: string;
    }>;
    removeMember(workGroupId: string, userId: string): Promise<{
        success: boolean;
    }>;
    assignTopics(workGroupId: string, dto: AssignWorkGroupTopicsDto): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }>;
    setActiveWorkGroup(userId: string, workGroupId: string, role: string): Promise<{
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }>;
    getActiveForUser(userId: string): Promise<({
        members: ({
            user: {
                id: string;
                email: string;
                name: string | null;
                role: import("@prisma/client").$Enums.Role;
                phone: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            roleInGroup: string;
            userId: string;
            workGroupId: string;
        })[];
        topics: ({
            category: {
                id: string;
                name: string;
                description: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            categoryId: string;
            workGroupId: string;
        })[];
        _count: {
            tickets: number;
            members: number;
        };
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        logoUrl: string | null;
        primaryColor: string;
        identifier: string;
        isActive: boolean;
    }) | null>;
    private includeDetail;
}
