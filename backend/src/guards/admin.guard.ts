import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import type { JwtPayload } from './jwt-auth.guard';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();

    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No hay sesión activa.');
    }

    try {
      const payload = this.jwtService.verify<JwtPayload>(token);

      if (payload.role !== 'admin') {
        throw new UnauthorizedException('No tienes permisos de administrador.');
      }

      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException(
        'Sesión inválida, expirada o sin permisos.',
      );
    }
  }

  private extractToken(request: Request): string | undefined {
    const cookieToken = request.cookies?.access_token as string | undefined;

    if (cookieToken) {
      return cookieToken;
    }

    const authorization = request.headers.authorization;

    if (authorization?.startsWith('Bearer ')) {
      return authorization.replace('Bearer ', '').trim();
    }

    return undefined;
  }
}
