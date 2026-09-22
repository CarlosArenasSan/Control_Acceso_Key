import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, IsNull, Not, Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { SolicitudHoraExtra } from '../entities/solicitud-hora-extra.entity';
import { resolverJornadaPorFecha } from '../utils/jornada';

const MAX_RANGE_DAYS = 90;
const MAX_MINUTOS_COMIDA = 65;

type IncidenceFilter =
  | 'todos'
  | 'puntuales'
  | 'retardos'
  | 'exceso_comida'
  | 'salidas_anticipadas'
  | 'ausencias';

export type { IncidenceFilter };

type EmployeeStatusFilter = 'todos' | 'activos' | 'inactivos';

export type { EmployeeStatusFilter };

type EstatusRegistro =
  | 'a_tiempo'
  | 'retardo'
  | 'fuera_de_rango'
  | 'antes_de_tiempo';

export interface HistorialRow {
  fecha: string;
  empleado: {
    id_empleado: number;
    nombre: string;
    activo: boolean;
  };
  entrada: {
    id_registro: number;
    hora: Date;
    estatus: EstatusRegistro | null;
    direccion: string | null;
    latitud: number;
    longitud: number;
    tieneFoto: boolean;
  } | null;
  comida: {
    salida: Date | null;
    regreso: Date | null;
    minutos: number | null;
    excedido: boolean;
    salidaDireccion: string | null;
    salidaGps: string | null;
    regresoDireccion: string | null;
    regresoGps: string | null;
  };
  salida: {
    id_registro: number;
    hora: Date;
    estatus: EstatusRegistro | null;
    direccion: string | null;
    latitud: number;
    longitud: number;
    tieneFoto: boolean;
  } | null;
  estadoDia: string;
  estadoEmpleado: string;
  gpsRegistro: string | null;
  direccionRegistro: string | null;
  incidencias: {
    retardo: boolean;
    excesoComida: boolean;
    salidaFueraRango: boolean;
    ausencia: boolean;
  };
  horasExtra: Partial<SolicitudHoraExtra> | null;
  registros: Array<{
    id_registro: number;
    tipo_registro: 'entrada' | 'salida' | 'salida_comida' | 'regreso_comida';
    estatus_registro: EstatusRegistro | null;
    fecha_y_hora: Date;
    direccion: string | null;
    latitud: number;
    longitud: number;
    tieneFoto: boolean;
  }>;
}

@Injectable()
export class RegistroHistorialService {
  constructor(
    @InjectRepository(RegistroAcceso)
    private readonly registroRepository: Repository<RegistroAcceso>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(FechaEspecial)
    private readonly fechaEspecialRepository: Repository<FechaEspecial>,
    @InjectRepository(SolicitudHoraExtra)
    private readonly solicitudHoraExtraRepository: Repository<SolicitudHoraExtra>,
  ) {}

  async findHistory(filters: {
    desde?: string;
    hasta?: string;
    empleado?: string;
    incidencia?: IncidenceFilter;
    estadoEmpleado?: EmployeeStatusFilter;
  }) {
    const desde = this.parseLocalDate(filters.desde);
    desde.setHours(0, 0, 0, 0);

    const hasta = this.parseLocalDate(filters.hasta);
    hasta.setHours(23, 59, 59, 999);

    if (desde.getTime() > hasta.getTime()) {
      throw new BadRequestException(
        'La fecha "desde" no puede ser posterior a "hasta".',
      );
    }

    const desdeDia = new Date(
      desde.getFullYear(),
      desde.getMonth(),
      desde.getDate(),
    );

    const hastaDia = new Date(
      hasta.getFullYear(),
      hasta.getMonth(),
      hasta.getDate(),
    );

    const hoyInicio = new Date();
    hoyInicio.setHours(0, 0, 0, 0);

    if (hastaDia.getTime() > hoyInicio.getTime()) {
      throw new BadRequestException(
        'La fecha "hasta" no puede ser posterior a hoy.',
      );
    }

    const rangoDias =
      Math.round((hastaDia.getTime() - desdeDia.getTime()) / 86400000) + 1;

    if (rangoDias > MAX_RANGE_DAYS) {
      throw new BadRequestException(
        `El rango máximo permitido es de ${MAX_RANGE_DAYS} días.`,
      );
    }

    const whereEmpleado: { activo?: boolean } = {};

    if (filters.estadoEmpleado === 'activos') {
      whereEmpleado.activo = true;
    }

    if (filters.estadoEmpleado === 'inactivos') {
      whereEmpleado.activo = false;
    }

    const empleados = await this.empleadoRepository.find({
      where: whereEmpleado,
      order: { id_empleado: 'ASC' },
    });

    const registros = await this.registroRepository.find({
      where: {
        fecha_y_hora: Between(desde, hasta),
      },
      relations: {
        empleado: true,
      },
      order: {
        fecha_y_hora: 'ASC',
      },
    });

    const registrosConFoto = new Set(
      (
        await this.registroRepository.find({
          where: {
            fecha_y_hora: Between(desde, hasta),
            fotografia: Not(IsNull()),
          },
          select: { id_registro: true },
        })
      ).map((registro) => registro.id_registro),
    );

    const fechaEspecialPorDia = await this.obtenerFechaEspecialPorDia(
      desde,
      hasta,
    );

    const horasExtraPorDia = await this.obtenerHorasExtraPorDia(desde, hasta);

    const dias = this.obtenerDiasEntre(desde, hasta);
    const rows: HistorialRow[] = [];

    const registrosPorDia = new Map<string, RegistroAcceso[]>();

    for (const registro of registros) {
      const key = `${registro.id_empleado}|${this.formatLocalDateKey(
        registro.fecha_y_hora,
      )}`;

      const lista = registrosPorDia.get(key);

      if (lista) {
        lista.push(registro);
      } else {
        registrosPorDia.set(key, [registro]);
      }
    }

    for (const empleado of empleados) {
      const nombreCompleto = `${empleado.nombre} ${empleado.apellido_paterno} ${
        empleado.apellido_materno ?? ''
      }`.trim();

      if (filters.empleado) {
        const busqueda = filters.empleado.toLowerCase();

        const coincide =
          nombreCompleto.toLowerCase().includes(busqueda) ||
          String(empleado.id_empleado).includes(busqueda);

        if (!coincide) continue;
      }

      const fechaAltaEmpleado = this.formatLocalDateKey(empleado.created_at);

      for (const dia of dias) {
        const fechaKey = this.formatLocalDateKey(dia);

        if (fechaKey <= fechaAltaEmpleado) {
          continue;
        }

        const registrosDia =
          registrosPorDia.get(`${empleado.id_empleado}|${fechaKey}`) ?? [];

        if (registrosDia.length === 0) {
          if (
            !empleado.activo ||
            !this.esDiaLaborable(dia, fechaEspecialPorDia)
          ) {
            continue;
          }

          if (
            filters.incidencia !== 'ausencias' &&
            filters.incidencia !== 'todos'
          ) {
            continue;
          }

          rows.push({
            fecha: fechaKey,
            empleado: {
              id_empleado: empleado.id_empleado,
              nombre: nombreCompleto,
              activo: empleado.activo,
            },
            entrada: null,
            comida: {
              salida: null,
              regreso: null,
              minutos: null,
              excedido: false,
              salidaDireccion: null,
              salidaGps: null,
              regresoDireccion: null,
              regresoGps: null,
            },
            salida: null,
            estadoDia: 'Falta',
            estadoEmpleado: empleado.activo ? 'Activo' : 'Inactivo',
            gpsRegistro: null,
            direccionRegistro: null,
            incidencias: {
              retardo: false,
              excesoComida: false,
              salidaFueraRango: false,
              ausencia: true,
            },
            horasExtra:
              horasExtraPorDia.get(`${empleado.id_empleado}|${fechaKey}`) ??
              null,
            registros: [],
          });

          continue;
        }

        const entrada = registrosDia.find(
          (item) => item.tipo_registro === 'entrada',
        );

        const salidaComida = registrosDia.find(
          (item) => item.tipo_registro === 'salida_comida',
        );

        const regresoComida = registrosDia.find(
          (item) => item.tipo_registro === 'regreso_comida',
        );

        const salida = registrosDia.find(
          (item) => item.tipo_registro === 'salida',
        );

        const minutosComida =
          salidaComida && regresoComida
            ? Math.round(
                (regresoComida.fecha_y_hora.getTime() -
                  salidaComida.fecha_y_hora.getTime()) /
                  60000,
              )
            : null;

        const excesoComida =
          minutosComida !== null ? minutosComida > MAX_MINUTOS_COMIDA : false;

        const retardo = entrada?.estatus_registro === 'retardo';
        const salidaFueraRango =
          salida?.estatus_registro === 'fuera_de_rango' ||
          salida?.estatus_registro === 'antes_de_tiempo';

        let estadoDia = 'Falta';

        if (
          entrada &&
          salida &&
          !retardo &&
          !excesoComida &&
          !salidaFueraRango
        ) {
          estadoDia = 'Día completo';
        } else if (entrada) {
          estadoDia = 'Con incidencia';
        }

        const row = {
          fecha: fechaKey,
          empleado: {
            id_empleado: empleado.id_empleado,
            nombre: nombreCompleto,
            activo: empleado.activo,
          },
          entrada: entrada
            ? {
                id_registro: entrada.id_registro,
                hora: entrada.fecha_y_hora,
                estatus: entrada.estatus_registro,
                direccion: entrada.direccion,
                latitud: entrada.latitud,
                longitud: entrada.longitud,
                tieneFoto: registrosConFoto.has(entrada.id_registro),
              }
            : null,
          comida: {
            salida: salidaComida?.fecha_y_hora ?? null,
            regreso: regresoComida?.fecha_y_hora ?? null,
            minutos: minutosComida,
            excedido: excesoComida,
            salidaDireccion: salidaComida?.direccion ?? null,
            salidaGps: salidaComida
              ? `${salidaComida.latitud}, ${salidaComida.longitud}`
              : null,
            regresoDireccion: regresoComida?.direccion ?? null,
            regresoGps: regresoComida
              ? `${regresoComida.latitud}, ${regresoComida.longitud}`
              : null,
          },
          salida: salida
            ? {
                id_registro: salida.id_registro,
                hora: salida.fecha_y_hora,
                estatus: salida.estatus_registro,
                direccion: salida.direccion,
                latitud: salida.latitud,
                longitud: salida.longitud,
                tieneFoto: registrosConFoto.has(salida.id_registro),
              }
            : null,
          estadoDia,
          estadoEmpleado: empleado.activo ? 'Activo' : 'Inactivo',
          gpsRegistro: entrada
            ? `${entrada.latitud}, ${entrada.longitud}`
            : salida
              ? `${salida.latitud}, ${salida.longitud}`
              : registrosDia[0]
                ? `${registrosDia[0].latitud}, ${registrosDia[0].longitud}`
                : null,
          direccionRegistro:
            entrada?.direccion ??
            salida?.direccion ??
            registrosDia[0]?.direccion ??
            null,
          incidencias: {
            retardo,
            excesoComida,
            salidaFueraRango,
            ausencia: !entrada,
          },
          horasExtra:
            horasExtraPorDia.get(`${empleado.id_empleado}|${fechaKey}`) ?? null,
          registros: registrosDia.map((registro) => ({
            id_registro: registro.id_registro,
            tipo_registro: registro.tipo_registro,
            estatus_registro: registro.estatus_registro,
            fecha_y_hora: registro.fecha_y_hora,
            direccion: registro.direccion,
            latitud: registro.latitud,
            longitud: registro.longitud,
            tieneFoto: registrosConFoto.has(registro.id_registro),
          })),
        };

        if (this.pasaFiltroIncidencia(row, filters.incidencia ?? 'todos')) {
          rows.push(row);
        }
      }
    }

    return rows;
  }

  private pasaFiltroIncidencia(row: HistorialRow, filtro: IncidenceFilter) {
    if (filtro === 'todos') return true;
    if (filtro === 'puntuales') return row.estadoDia === 'Día completo';
    if (filtro === 'retardos') return row.incidencias.retardo;
    if (filtro === 'exceso_comida') return row.incidencias.excesoComida;
    if (filtro === 'salidas_anticipadas') {
      return row.incidencias.salidaFueraRango;
    }
    if (filtro === 'ausencias') return row.incidencias.ausencia;

    return true;
  }

  private obtenerDiasEntre(desde: Date, hasta: Date) {
    const dias: Date[] = [];
    const actual = new Date(desde);

    while (actual <= hasta) {
      dias.push(new Date(actual));
      actual.setDate(actual.getDate() + 1);
    }

    return dias;
  }

  private async obtenerFechaEspecialPorDia(
    desde: Date,
    hasta: Date,
  ): Promise<Map<string, FechaEspecial>> {
    const fechaEspeciales = await this.fechaEspecialRepository.find({
      where: {
        activo: true,
        fecha: Between(
          this.formatLocalDateKey(desde),
          this.formatLocalDateKey(hasta),
        ),
      },
    });

    return new Map(
      fechaEspeciales.map((fechaEspecial) => [
        fechaEspecial.fecha,
        fechaEspecial,
      ]),
    );
  }

  private async obtenerHorasExtraPorDia(
    desde: Date,
    hasta: Date,
  ): Promise<Map<string, Partial<SolicitudHoraExtra>>> {
    const solicitudes = await this.solicitudHoraExtraRepository.find({
      where: {
        activo: true,
        fecha_trabajo: Between(
          this.formatLocalDateKey(desde),
          this.formatLocalDateKey(hasta),
        ),
      },
      select: {
        id_empleado: true,
        fecha_trabajo: true,
        minutos_solicitados: true,
        minutos_autorizados: true,
        estado: true,
      },
    });

    return new Map(
      solicitudes.map((solicitud) => [
        `${solicitud.id_empleado}|${solicitud.fecha_trabajo}`,
        {
          minutos_solicitados: solicitud.minutos_solicitados,
          minutos_autorizados: solicitud.minutos_autorizados,
          estado: solicitud.estado,
        },
      ]),
    );
  }

  private esDiaLaborable(
    fecha: Date,
    fechaEspecialPorDia: Map<string, FechaEspecial>,
  ) {
    const fechaKey = this.formatLocalDateKey(fecha);

    return resolverJornadaPorFecha(
      fecha,
      fechaEspecialPorDia.get(fechaKey) ?? null,
    ).esLaborable;
  }

  private parseLocalDate(value?: string) {
    if (!value) return new Date();

    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private formatLocalDateKey(fecha: Date) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
