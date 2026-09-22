import { Administrador } from './administrador.entity';
type TipoJornada = 'jornada_completa' | 'media_jornada' | 'no_laborable';
export declare class FechaEspecial {
    id_fecha_especial: number;
    fecha: string;
    nombre: string;
    tipo_jornada: TipoJornada;
    hora_inicio_entrada: string | null;
    hora_fin_entrada: string | null;
    hora_inicio_salida: string | null;
    hora_fin_salida: string | null;
    requiere_comida: boolean;
    observaciones: string | null;
    activo: boolean;
    id_admin: number;
    created_at: Date;
    updated_at: Date;
    administrador: Administrador;
}
export {};
