export declare class Empleado {
    id_empleado: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno: string | null;
    username: string;
    password_hash: string;
    activo: boolean;
    created_at: Date;
}
