import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { FechaEspecialService } from '../services/fecha-especial.service';
import { AdminGuard } from '../guards/admin.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import {
  CreateFechaEspecialDto,
  UpdateFechaEspecialDto,
  UpdateFechaStatusDto,
} from '../dto/fecha-especial.dto';

@Controller('fechas-especiales')
@UseGuards(AdminGuard)
export class FechaEspecialRoute {
  constructor(private readonly fechaService: FechaEspecialService) {}

  @Get()
  findAll() {
    return this.fechaService.findAll();
  }

  @Post()
  create(
    @Body() body: CreateFechaEspecialDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.fechaService.create(body, user.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFechaEspecialDto,
  ) {
    return this.fechaService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateFechaStatusDto,
  ) {
    return this.fechaService.updateStatus(id, body.activo);
  }
}
