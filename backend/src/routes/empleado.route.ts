import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { EmpleadoService } from '../services/empleado.service';
import { AdminGuard } from '../guards/admin.guard';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from '../dto/empleado.dto';

@Controller('empleados')
@UseGuards(AdminGuard)
export class EmpleadoRoute {
  constructor(private readonly empleadoService: EmpleadoService) {}

  @Get()
  findAll() {
    return this.empleadoService.findAll();
  }

  @Post()
  create(@Body() body: CreateEmpleadoDto) {
    return this.empleadoService.create(body);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateEmpleadoDto,
  ) {
    return this.empleadoService.update(id, body);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.empleadoService.delete(id);
  }
}
