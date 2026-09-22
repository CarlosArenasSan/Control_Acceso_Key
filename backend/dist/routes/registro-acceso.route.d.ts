import type { Response } from 'express';
import { Repository } from 'typeorm';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { RegistroAccesoService } from '../services/registro-acceso.service';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import { CreateRegistroAccesoDto, CreateRegistroManualDto } from '../dto/registro-acceso.dto';
import 'multer';
export declare class RegistroAccesoRoute {
    private readonly registroService;
    private readonly registroRepository;
    constructor(registroService: RegistroAccesoService, registroRepository: Repository<RegistroAcceso>);
    create(user: JwtPayload, body: CreateRegistroAccesoDto, file?: Express.Multer.File): Promise<{
        message: string;
        direccion: string | null;
        registro: {
            id_registro: number;
            tipo_registro: "entrada" | "salida" | "salida_comida" | "regreso_comida";
            estatus_registro: ("a_tiempo" | "retardo" | "fuera_de_rango" | "antes_de_tiempo") | null;
            latitud: number;
            longitud: number;
            direccion: string | null;
            fecha_y_hora: Date;
            id_empleado: number;
        };
    }>;
    getFoto(id: number, res: Response): Promise<Response<any, Record<string, any>>>;
    getRegistrosManualesDeHoy(): Promise<{
        id_registro: number;
        tipo_registro: "entrada" | "salida" | "salida_comida" | "regreso_comida";
        fecha_y_hora: Date;
        direccion: string | null;
        empleado: {
            id_empleado: number;
            nombre: string;
            apellido_paterno: string;
        };
    }[]>;
    createManual(body: CreateRegistroManualDto): Promise<{
        message: string;
        registro: RegistroAcceso;
    }>;
}
