declare const ESTADOS_RESPUESTA: readonly ["aprobada", "rechazada"];
export type EstadoRespuesta = (typeof ESTADOS_RESPUESTA)[number];
export declare class CreateSolicitudHoraExtraDto {
    fecha_trabajo: string;
    minutos_solicitados: number;
    motivo: string;
}
export declare class ResponderSolicitudHoraExtraDto {
    estado: EstadoRespuesta;
    minutos_autorizados?: number;
    comentario_respuesta?: string;
}
export {};
