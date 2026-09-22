import { PuntoAutorizadoService } from '../services/punto-autorizado.service';
import { CreatePuntoAutorizadoDto, ResolveLocationDto, UpdatePuntoStatusDto } from '../dto/punto-autorizado.dto';
export declare class PuntoAutorizadoRoute {
    private readonly puntoService;
    constructor(puntoService: PuntoAutorizadoService);
    findAll(): Promise<import("../entities/punto-autorizado.entity").PuntoAutorizado[]>;
    create(body: CreatePuntoAutorizadoDto): Promise<import("../entities/punto-autorizado.entity").PuntoAutorizado>;
    updateStatus(id: number, body: UpdatePuntoStatusDto): Promise<import("../entities/punto-autorizado.entity").PuntoAutorizado>;
    delete(id: number): Promise<{
        message: string;
    }>;
    resolveLocation(body: ResolveLocationDto): Promise<{
        found: boolean;
        direccion: null;
        punto: null;
    } | {
        found: boolean;
        direccion: string;
        punto: {
            id_punto: number;
            nombre: string;
            direccion_fija: string;
            radio_metros: number;
        };
    }>;
}
