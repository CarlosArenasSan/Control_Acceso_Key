import { FechaEspecialService } from '../services/fecha-especial.service';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import { CreateFechaEspecialDto, UpdateFechaEspecialDto, UpdateFechaStatusDto } from '../dto/fecha-especial.dto';
export declare class FechaEspecialRoute {
    private readonly fechaService;
    constructor(fechaService: FechaEspecialService);
    findAll(): Promise<import("../entities/fecha-especial.entity").FechaEspecial[]>;
    create(body: CreateFechaEspecialDto, user: JwtPayload): Promise<import("../entities/fecha-especial.entity").FechaEspecial>;
    update(id: number, body: UpdateFechaEspecialDto): Promise<import("../entities/fecha-especial.entity").FechaEspecial>;
    updateStatus(id: number, body: UpdateFechaStatusDto): Promise<import("../entities/fecha-especial.entity").FechaEspecial>;
}
