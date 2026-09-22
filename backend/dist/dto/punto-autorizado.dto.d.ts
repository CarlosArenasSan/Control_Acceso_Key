export declare class CreatePuntoAutorizadoDto {
    nombre: string;
    latitud: number;
    longitud: number;
    radio_metros: number;
    direccion_fija: string;
    activo?: boolean;
}
export declare class UpdatePuntoStatusDto {
    activo: boolean;
}
export declare class ResolveLocationDto {
    latitud: number;
    longitud: number;
}
