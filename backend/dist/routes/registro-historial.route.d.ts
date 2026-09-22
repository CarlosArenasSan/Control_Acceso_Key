import { RegistroHistorialService } from '../services/registro-historial.service';
export declare class RegistroHistorialRoute {
    private readonly historialService;
    constructor(historialService: RegistroHistorialService);
    findHistory(desde?: string, hasta?: string, empleado?: string, incidencia?: string, estadoEmpleado?: string): Promise<import("../services/registro-historial.service").HistorialRow[]>;
}
