import { Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { SolicitudHoraExtra } from '../entities/solicitud-hora-extra.entity';
export declare class AdminDashboardService {
    private readonly empleadoRepository;
    private readonly registroRepository;
    private readonly fechaEspecialRepository;
    private readonly solicitudHoraExtraRepository;
    constructor(empleadoRepository: Repository<Empleado>, registroRepository: Repository<RegistroAcceso>, fechaEspecialRepository: Repository<FechaEspecial>, solicitudHoraExtraRepository: Repository<SolicitudHoraExtra>);
    getStartPanel(): Promise<{
        kpis: {
            presentes: number;
            retardos: number;
            enComida: number;
            excedidosComida: number;
            ausencias: number;
            horasExtraAprobadas: number;
        };
        puntualidadSemanal: {
            dia: string;
            aTiempo: number;
            retardos: number;
        }[];
        incidencias: {
            id_registro: number;
            empleado: string;
            tipo: ("a_tiempo" | "retardo" | "fuera_de_rango" | "antes_de_tiempo") | null;
            detalle: string;
            fecha_y_hora: string;
            horasExtra: Partial<SolicitudHoraExtra> | null;
        }[];
    }>;
    private getIncidencias;
    private obtenerHorasExtraDeHoy;
    private getPuntualidadSemanal;
    private obtenerFechaEspecialDeHoy;
    private obtenerFechaEspecialEnRango;
    private formatFechaKey;
    private obtenerRangoDiaActual;
    private formatDateTimeLocal;
}
