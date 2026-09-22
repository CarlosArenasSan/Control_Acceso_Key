import { DataSource, Repository } from 'typeorm';
import { SolicitudHoraExtra } from '../entities/solicitud-hora-extra.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import { CreateSolicitudHoraExtraDto, ResponderSolicitudHoraExtraDto } from '../dto/solicitud-hora-extra.dto';
export declare class SolicitudHoraExtraService {
    private readonly solicitudRepository;
    private readonly fechaEspecialRepository;
    private readonly dataSource;
    constructor(solicitudRepository: Repository<SolicitudHoraExtra>, fechaEspecialRepository: Repository<FechaEspecial>, dataSource: DataSource);
    create(user: JwtPayload, dto: CreateSolicitudHoraExtraDto): Promise<SolicitudHoraExtra>;
    respond(id: number, dto: ResponderSolicitudHoraExtraDto, idAdmin: number): Promise<SolicitudHoraExtra>;
    cancel(id: number, user: JwtPayload): Promise<SolicitudHoraExtra>;
    getSaldo(idEmpleado: number): Promise<{
        limite_dias: number;
        dias_ocupados: number;
        dias_disponibles: number;
        minutos_aprobados: number;
        minutos_pendientes: number;
    }>;
    findMine(idEmpleado: number): Promise<SolicitudHoraExtra[]>;
    findAll(): Promise<SolicitudHoraExtra[]>;
    private obtenerInicioSemanaActual;
    obtenerMinutosAutorizados(idEmpleado: number, fechaTrabajo: string): Promise<number>;
    private validarFechaTrabajo;
    private validarDiasDisponibles;
    private obtenerSolicitudesSemanales;
    private obtenerRangoSemana;
    private parseLocalDate;
    private formatLocalDateKey;
}
