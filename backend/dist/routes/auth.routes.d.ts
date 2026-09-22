import type { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/auth.dto';
import { type AuthenticatedRequest } from '../guards/jwt-auth.guard';
export declare class AuthRoutes {
    private readonly authService;
    constructor(authService: AuthService);
    login(body: LoginDto, res: Response): Promise<{
        user: {
            id: number;
            username: string;
            role: "admin";
            fullName: string;
        } | {
            id: number;
            username: string;
            role: "empleado";
            fullName: string;
        };
        expiresAt: number;
    }>;
    me(request: AuthenticatedRequest): {
        user: import("../guards/jwt-auth.guard").JwtPayload;
    };
    logout(res: Response): {
        message: string;
    };
}
