export declare enum TipoRegistroDto {
    ENTRADA = "entrada",
    SALIDA = "salida",
    SALIDA_COMIDA = "salida_comida",
    REGRESO_COMIDA = "regreso_comida"
}
export declare enum TipoDireccionManualDto {
    MANUAL = "manual",
    PUNTO = "punto"
}
export declare class CreateRegistroAccesoDto {
    tipo_registro: TipoRegistroDto;
    latitud: number;
    longitud: number;
}
export declare class CreateRegistroManualDto {
    id_empleado: number;
    tipo_registro: TipoRegistroDto;
    fecha: string;
    hora: string;
    tipo_direccion: TipoDireccionManualDto;
    id_punto?: number;
    direccion_manual?: string;
    observacion?: string;
}
