import { Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { SolicitudHoraExtra } from '../entities/solicitud-hora-extra.entity';
type IncidenceFilter = 'todos' | 'puntuales' | 'retardos' | 'exceso_comida' | 'salidas_anticipadas' | 'ausencias';
export type { IncidenceFilter };
type EmployeeStatusFilter = 'todos' | 'activos' | 'inactivos';
export type { EmployeeStatusFilter };
type EstatusRegistro = 'a_tiempo' | 'retardo' | 'fuera_de_rango' | 'antes_de_tiempo';
export interface HistorialRow {
    fecha: string;
    empleado: {
        id_empleado: number;
        nombre: string;
        activo: boolean;
    };
    entrada: {
        id_registro: number;
        hora: Date;
        estatus: EstatusRegistro | null;
        direccion: string | null;
        latitud: number;
        longitud: number;
        tieneFoto: boolean;
    } | null;
    comida: {
        salida: Date | null;
        regreso: Date | null;
        minutos: number | null;
        excedido: boolean;
        salidaDireccion: string | null;
        salidaGps: string | null;
        regresoDireccion: string | null;
        regresoGps: string | null;
    };
    salida: {
        id_registro: number;
        hora: Date;
        estatus: EstatusRegistro | null;
        direccion: string | null;
        latitud: number;
        longitud: number;
        tieneFoto: boolean;
    } | null;
    estadoDia: string;
    estadoEmpleado: string;
    gpsRegistro: string | null;
    direccionRegistro: string | null;
    incidencias: {
        retardo: boolean;
        excesoComida: boolean;
        salidaFueraRango: boolean;
        ausencia: boolean;
    };
    horasExtra: Partial<SolicitudHoraExtra> | null;
    registros: Array<{
        id_registro: number;
        tipo_registro: 'entrada' | 'salida' | 'salida_comida' | 'regreso_comida';
        estatus_registro: EstatusRegistro | null;
        fecha_y_hora: Date;
        direccion: string | null;
        latitud: number;
        longitud: number;
        tieneFoto: boolean;
    }>;
}
export declare class RegistroHistorialService {
    private readonly registroRepository;
    private readonly empleadoRepository;
    private readonly fechaEspecialRepository;
    private readonly solicitudHoraExtraRepository;
    constructor(registroRepository: Repository<RegistroAcceso>, empleadoRepository: Repository<Empleado>, fechaEspecialRepository: Repository<FechaEspecial>, solicitudHoraExtraRepository: Repository<SolicitudHoraExtra>);
    findHistory(filters: {
        desde?: string;
        hasta?: string;
        empleado?: string;
        incidencia?: IncidenceFilter;
        estadoEmpleado?: EmployeeStatusFilter;
    }): Promise<HistorialRow[]>;
    private pasaFiltroIncidencia;
    private obtenerDiasEntre;
    private obtenerFechaEspecialPorDia;
    private obtenerHorasExtraPorDia;
    private esDiaLaborable;
    private parseLocalDate;
    private formatLocalDateKey;
}
