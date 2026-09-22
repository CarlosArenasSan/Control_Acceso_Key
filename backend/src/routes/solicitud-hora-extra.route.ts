import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { SolicitudHoraExtraService } from '../services/solicitud-hora-extra.service';
import { AdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import { EmpleadoGuard } from '../guards/empleado.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import {
  CreateSolicitudHoraExtraDto,
  ResponderSolicitudHoraExtraDto,
} from '../dto/solicitud-hora-extra.dto';

@Controller('solicitudes-horas-extra')
export class SolicitudHoraExtraRoute {
  constructor(private readonly solicitudService: SolicitudHoraExtraService) {}

  @Post()
  @UseGuards(JwtAuthGuard, EmpleadoGuard)
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: CreateSolicitudHoraExtraDto,
  ) {
    return this.solicitudService.create(user, body);
  }

  @Get('mias')
  @UseGuards(JwtAuthGuard, EmpleadoGuard)
  findMine(@CurrentUser() user: JwtPayload) {
    return this.solicitudService.findMine(user.id);
  }

  @Get('mi-saldo')
  @UseGuards(JwtAuthGuard, EmpleadoGuard)
  getMiSaldo(@CurrentUser() user: JwtPayload) {
    return this.solicitudService.getSaldo(user.id);
  }

  @Patch(':id/cancelar')
  @UseGuards(JwtAuthGuard, EmpleadoGuard)
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.cancel(id, user);
  }

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.solicitudService.findAll();
  }

  @Patch(':id/responder')
  @UseGuards(AdminGuard)
  respond(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: ResponderSolicitudHoraExtraDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.solicitudService.respond(id, body, user.id);
  }
}
