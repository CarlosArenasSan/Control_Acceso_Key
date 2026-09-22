import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  EmployeeStatusFilter,
  IncidenceFilter,
  RegistroHistorialService,
} from '../services/registro-historial.service';
import { AdminGuard } from '../guards/admin.guard';

@Controller('registro-historial')
@UseGuards(AdminGuard)
export class RegistroHistorialRoute {
  constructor(private readonly historialService: RegistroHistorialService) {}

  @Get()
  findHistory(
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('empleado') empleado?: string,
    @Query('incidencia') incidencia?: string,
    @Query('estadoEmpleado') estadoEmpleado?: string,
  ) {
    return this.historialService.findHistory({
      desde,
      hasta,
      empleado,
      incidencia: incidencia as IncidenceFilter | undefined,
      estadoEmpleado: estadoEmpleado as EmployeeStatusFilter | undefined,
    });
  }
}
