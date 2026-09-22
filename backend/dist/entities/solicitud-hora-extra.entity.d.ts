import { Empleado } from './empleado.entity';
import { Administrador } from './administrador.entity';
type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';
export declare class SolicitudHoraExtra {
    id_solicitud: number;
    id_empleado: number;
    fecha_trabajo: string;
    minutos_solicitados: number;
    motivo: string;
    estado: EstadoSolicitud;
    minutos_autorizados: number | null;
    comentario_respuesta: string | null;
    id_admin_respuesta: number | null;
    fecha_solicitud: Date;
    fecha_respuesta: Date | null;
    activo: boolean;
    created_at: Date;
    updated_at: Date;
    empleado: Empleado;
    administrador: Administrador | null;
}
export {};
