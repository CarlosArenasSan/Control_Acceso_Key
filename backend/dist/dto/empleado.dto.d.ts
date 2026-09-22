export declare class CreateEmpleadoDto {
    id_empleado: number;
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    username: string;
    password: string;
    activo?: boolean;
}
export declare class UpdateEmpleadoDto {
    nombre: string;
    apellido_paterno: string;
    apellido_materno?: string;
    username: string;
    password?: string;
    activo: boolean;
}
