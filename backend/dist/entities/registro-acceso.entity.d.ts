import { Empleado } from './empleado.entity';
type TipoRegistro = 'entrada' | 'salida' | 'salida_comida' | 'regreso_comida';
type EstatusRegistro = 'a_tiempo' | 'retardo' | 'fuera_de_rango' | 'antes_de_tiempo';
export declare class RegistroAcceso {
    id_registro: number;
    fotografia: Buffer | null;
    latitud: number;
    longitud: number;
    direccion: string | null;
    tipo_registro: TipoRegistro;
    estatus_registro: EstatusRegistro | null;
    fecha_y_hora: Date;
    id_empleado: number;
    fecha_registro: Date | null;
    empleado: Empleado;
}
export {};
