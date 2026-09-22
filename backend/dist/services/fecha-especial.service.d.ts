import { Repository } from 'typeorm';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { CreateFechaEspecialDto, UpdateFechaEspecialDto } from '../dto/fecha-especial.dto';
export declare class FechaEspecialService {
    private readonly fechaRepository;
    constructor(fechaRepository: Repository<FechaEspecial>);
    findAll(): Promise<FechaEspecial[]>;
    create(data: CreateFechaEspecialDto, idAdmin: number): Promise<FechaEspecial>;
    update(id: number, data: UpdateFechaEspecialDto): Promise<FechaEspecial>;
    updateStatus(id: number, activo: boolean): Promise<FechaEspecial>;
}
