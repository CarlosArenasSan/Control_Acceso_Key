import { AdminDashboardService } from '../services/admin-dashboard.service';
export declare class AdminDashboardRoute {
    private readonly dashboardService;
    constructor(dashboardService: AdminDashboardService);
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
            horasExtra: Partial<import("../entities/solicitud-hora-extra.entity").SolicitudHoraExtra> | null;
        }[];
    }>;
}
