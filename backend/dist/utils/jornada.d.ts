import { FechaEspecial } from '../entities/fecha-especial.entity';
export interface JornadaResuelta {
    esLaborable: boolean;
    nombre: string;
    requiereComida: boolean;
    entradaInicio: number | null;
    entradaFin: number | null;
    salidaInicio: number | null;
    salidaFin: number | null;
    permiteExtensionHorasExtras: boolean;
}
export declare function resolverJornadaPorFecha(fecha: Date, fechaEspecial: FechaEspecial | null): JornadaResuelta;
export declare function convertirHoraAMinutos(hora: string | null): number | null;
