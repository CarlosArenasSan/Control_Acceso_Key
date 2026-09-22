import { Repository } from 'typeorm';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { PuntoAutorizado } from '../entities/punto-autorizado.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { JwtPayload } from '../guards/jwt-auth.guard';
import { CreateRegistroAccesoDto, CreateRegistroManualDto } from '../dto/registro-acceso.dto';
import { SolicitudHoraExtraService } from './solicitud-hora-extra.service';
export declare class RegistroAccesoService {
    private readonly registroRepository;
    private readonly puntoRepository;
    private readonly fechaEspecialRepository;
    private readonly solicitudHoraExtraService;
    constructor(registroRepository: Repository<RegistroAcceso>, puntoRepository: Repository<PuntoAutorizado>, fechaEspecialRepository: Repository<FechaEspecial>, solicitudHoraExtraService: SolicitudHoraExtraService);
    createRegistro(user: JwtPayload, body: CreateRegistroAccesoDto, file?: Express.Multer.File): Promise<{
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
    createRegistroManual(body: CreateRegistroManualDto): Promise<{
        message: string;
        registro: RegistroAcceso;
    }>;
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
    private validarRegistroUnicoPorFecha;
    private obtenerEstatusRegistro;
    private obtenerMinutosExtensionSalida;
    private formatearMinutos;
    private obtenerMensajeRegistro;
    private validarFlujoDelDia;
    private validarRegistroUnicoDelDia;
    private obtenerRangoDiaActual;
    private obtenerNombreTipoRegistro;
    private obtenerPuntoAutorizadoCercano;
    private calcularDistanciaMetros;
    private obtenerDireccionGoogle;
    private resolverJornada;
    private formatearFechaLocal;
    private validarRegistroSegunJornada;
}
