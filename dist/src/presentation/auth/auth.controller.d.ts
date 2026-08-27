import { AuthService } from '../../application/services/auth.service';
import { LoginDto, RegisterDto } from '../../application/dtos/auth.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        id: string;
        email: string;
        name: string | null;
        role: import("@prisma/client").$Enums.Role;
        pushToken: string | null;
        phone: string | null;
        createdAt: Date;
        updatedAt: Date;
        activeWorkGroupId: string | null;
    }>;
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            email: string;
            name: string | null;
            role: import("@prisma/client").$Enums.Role;
        };
    }>;
}
