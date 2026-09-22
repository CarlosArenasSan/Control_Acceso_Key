import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
export interface JwtPayload {
    id: number;
    username: string;
    role: 'admin' | 'empleado';
    fullName?: string;
}
export interface AuthenticatedRequest extends Request {
    user: JwtPayload;
}
export declare class JwtAuthGuard implements CanActivate {
    private readonly jwtService;
    constructor(jwtService: JwtService);
    canActivate(context: ExecutionContext): boolean;
    private extractToken;
}
