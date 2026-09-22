import { Repository } from 'typeorm';
import { PuntoAutorizado } from '../entities/punto-autorizado.entity';
import { CreatePuntoAutorizadoDto } from '../dto/punto-autorizado.dto';
export declare class PuntoAutorizadoService {
    private readonly puntoRepository;
    constructor(puntoRepository: Repository<PuntoAutorizado>);
    findAll(): Promise<PuntoAutorizado[]>;
    create(data: CreatePuntoAutorizadoDto): Promise<PuntoAutorizado>;
    updateStatus(id: number, activo: boolean): Promise<PuntoAutorizado>;
    delete(id: number): Promise<{
        message: string;
    }>;
    resolveLocation(latitud: number, longitud: number): Promise<{
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
    private obtenerPuntoAutorizadoCercano;
    private calcularDistanciaMetros;
}
