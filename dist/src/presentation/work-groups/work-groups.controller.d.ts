import { WorkGroupService } from '../../application/use-cases/work-group.service';
import { CreateWorkGroupDto, UpdateWorkGroupDto, AddWorkGroupMemberDto, AssignWorkGroupTopicsDto, SetActiveWorkGroupDto, UpdateUserContactDto } from '../../application/dtos/work-group.dto';
import { PrismaService } from '../../infrastructure/prisma/prisma.service';
import { DailyDigestService } from '../../infrastructure/notifications/daily-digest.service';
export declare class WorkGroupsController {
    private readonly workGroupService;
    private readonly prisma;
    private readonly dailyDigestService;
    constructor(workGroupService: WorkGroupService, prisma: PrismaService, dailyDigestService: DailyDigestService);
    list(user: {
        userId: string;
        role: string;
    }): Promise<({
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
    getActive(user: {
        userId: string;
    }): Promise<({
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
    setActive(dto: SetActiveWorkGroupDto, user: {
        userId: string;
        role: string;
    }): Promise<{
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
    updateContact(dto: UpdateUserContactDto, user: {
        userId: string;
    }): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        phone: string | null;
    }>;
    runDigestNow(): Promise<{
        recipients: number;
        pending: number;
    }>;
    create(dto: CreateWorkGroupDto, user: {
        userId: string;
    }): Promise<{
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
    findOne(id: string): Promise<{
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
    addMember(id: string, dto: AddWorkGroupMemberDto): Promise<{
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
    removeMember(id: string, userId: string): Promise<{
        success: boolean;
    }>;
    assignTopics(id: string, dto: AssignWorkGroupTopicsDto): Promise<{
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
}
