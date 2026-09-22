import { EmpleadoService } from '../services/empleado.service';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from '../dto/empleado.dto';
export declare class EmpleadoRoute {
    private readonly empleadoService;
    constructor(empleadoService: EmpleadoService);
    findAll(): Promise<import("../entities/empleado.entity").Empleado[]>;
    create(body: CreateEmpleadoDto): Promise<import("../entities/empleado.entity").Empleado>;
    update(id: number, body: UpdateEmpleadoDto): Promise<import("../entities/empleado.entity").Empleado>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
