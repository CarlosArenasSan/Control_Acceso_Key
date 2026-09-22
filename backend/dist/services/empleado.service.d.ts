import { Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from '../dto/empleado.dto';
export declare class EmpleadoService {
    private readonly empleadoRepository;
    private readonly registroRepository;
    constructor(empleadoRepository: Repository<Empleado>, registroRepository: Repository<RegistroAcceso>);
    findAll(): Promise<Empleado[]>;
    create(data: CreateEmpleadoDto): Promise<Empleado>;
    update(id: number, data: UpdateEmpleadoDto): Promise<Empleado>;
    delete(id: number): Promise<{
        message: string;
    }>;
}
