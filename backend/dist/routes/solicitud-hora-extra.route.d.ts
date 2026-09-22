import { SolicitudHoraExtraService } from '../services/solicitud-hora-extra.service';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import { CreateSolicitudHoraExtraDto, ResponderSolicitudHoraExtraDto } from '../dto/solicitud-hora-extra.dto';
export declare class SolicitudHoraExtraRoute {
    private readonly solicitudService;
    constructor(solicitudService: SolicitudHoraExtraService);
    create(user: JwtPayload, body: CreateSolicitudHoraExtraDto): Promise<import("../entities/solicitud-hora-extra.entity").SolicitudHoraExtra>;
    findMine(user: JwtPayload): Promise<import("../entities/solicitud-hora-extra.entity").SolicitudHoraExtra[]>;
    getMiSaldo(user: JwtPayload): Promise<{
        limite_dias: number;
        dias_ocupados: number;
        dias_disponibles: number;
        minutos_aprobados: number;
        minutos_pendientes: number;
    }>;
    cancel(id: number, user: JwtPayload): Promise<import("../entities/solicitud-hora-extra.entity").SolicitudHoraExtra>;
    findAll(): Promise<import("../entities/solicitud-hora-extra.entity").SolicitudHoraExtra[]>;
    respond(id: number, body: ResponderSolicitudHoraExtraDto, user: JwtPayload): Promise<import("../entities/solicitud-hora-extra.entity").SolicitudHoraExtra>;
}
