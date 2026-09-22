declare const TIPOS_JORNADA: readonly ["jornada_completa", "media_jornada", "no_laborable"];
export type TipoJornada = (typeof TIPOS_JORNADA)[number];
export declare class CreateFechaEspecialDto {
    fecha: string;
    nombre: string;
    tipo_jornada: TipoJornada;
    observaciones?: string;
    activo?: boolean;
}
export declare class UpdateFechaEspecialDto {
    nombre?: string;
    tipo_jornada?: TipoJornada;
    observaciones?: string;
}
export declare class UpdateFechaStatusDto {
    activo: boolean;
}
export {};
