import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { PuntoAutorizadoService } from '../services/punto-autorizado.service';
import { AdminGuard } from '../guards/admin.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import {
  CreatePuntoAutorizadoDto,
  ResolveLocationDto,
  UpdatePuntoStatusDto,
} from '../dto/punto-autorizado.dto';

@Controller('puntos-autorizados')
export class PuntoAutorizadoRoute {
  constructor(private readonly puntoService: PuntoAutorizadoService) {}

  @Get()
  @UseGuards(AdminGuard)
  findAll() {
    return this.puntoService.findAll();
  }

  @Post()
  @UseGuards(AdminGuard)
  create(@Body() body: CreatePuntoAutorizadoDto) {
    return this.puntoService.create(body);
  }

  @Patch(':id/status')
  @UseGuards(AdminGuard)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdatePuntoStatusDto,
  ) {
    return this.puntoService.updateStatus(id, body.activo);
  }

  @Delete(':id')
  @UseGuards(AdminGuard)
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.puntoService.delete(id);
  }

  @Post('resolve-location')
  @UseGuards(JwtAuthGuard)
  resolveLocation(@Body() body: ResolveLocationDto) {
    return this.puntoService.resolveLocation(body.latitud, body.longitud);
  }
}
