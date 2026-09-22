import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { AuthenticatedRequest } from './jwt-auth.guard';

@Injectable()
export class EmpleadoGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (request.user?.role !== 'empleado') {
      throw new ForbiddenException(
        'Esta acción sólo está permitida para empleados.',
      );
    }

    return true;
  }
}
