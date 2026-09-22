import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { SolicitudHoraExtra } from '../entities/solicitud-hora-extra.entity';
import { resolverJornadaPorFecha } from '../utils/jornada';

const MAX_MINUTOS_COMIDA = 65;

@Injectable()
export class AdminDashboardService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(RegistroAcceso)
    private readonly registroRepository: Repository<RegistroAcceso>,
    @InjectRepository(FechaEspecial)
    private readonly fechaEspecialRepository: Repository<FechaEspecial>,
    @InjectRepository(SolicitudHoraExtra)
    private readonly solicitudHoraExtraRepository: Repository<SolicitudHoraExtra>,
  ) {}

  async getStartPanel() {
    const { inicioDia, finDia } = this.obtenerRangoDiaActual();

    const empleadosActivosHoy = await this.empleadoRepository.find({
      where: { activo: true },
    });

    const empleadosActivosHoyIds = new Set(
      empleadosActivosHoy.map((empleado) => empleado.id_empleado),
    );

    const empleadosContablesParaAusencia = await this.empleadoRepository.find({
      where: {
        activo: true,
        created_at: LessThan(inicioDia),
      },
    });

    const empleadosContablesParaAusenciaIds = new Set(
      empleadosContablesParaAusencia.map((empleado) => empleado.id_empleado),
    );

    const registrosHoy = await this.registroRepository.find({
      where: {
        fecha_y_hora: Between(inicioDia, finDia),
      },
      relations: {
        empleado: true,
      },
    });

    const registrosHoyActivos = registrosHoy.filter((registro) =>
      empleadosActivosHoyIds.has(registro.id_empleado),
    );

    const presentes = new Set(
      registrosHoyActivos
        .filter((registro) => registro.tipo_registro === 'entrada')
        .map((registro) => registro.id_empleado),
    );

    const presentesContablesParaAusencia = new Set(
      Array.from(presentes).filter((idEmpleado) =>
        empleadosContablesParaAusenciaIds.has(idEmpleado),
      ),
    );

    const retardos = registrosHoyActivos.filter(
      (registro) =>
        registro.tipo_registro === 'entrada' &&
        registro.estatus_registro === 'retardo',
    );

    const salidasComida = registrosHoyActivos.filter(
      (registro) => registro.tipo_registro === 'salida_comida',
    );

    const regresosComida = registrosHoyActivos.filter(
      (registro) => registro.tipo_registro === 'regreso_comida',
    );

    const empleadosEnComida = salidasComida.filter((salida) => {
      return !regresosComida.some(
        (regreso) => regreso.id_empleado === salida.id_empleado,
      );
    });

    const excedidosComida = salidasComida.filter((salida) => {
      const regreso = regresosComida.find(
        (item) => item.id_empleado === salida.id_empleado,
      );

      if (!regreso) {
        return false;
      }

      const minutos =
        (regreso.fecha_y_hora.getTime() - salida.fecha_y_hora.getTime()) /
        60000;

      return minutos > MAX_MINUTOS_COMIDA;
    });

    const jornadaHoy = resolverJornadaPorFecha(
      new Date(),
      await this.obtenerFechaEspecialDeHoy(),
    );

    const horasExtraPorEmpleado = await this.obtenerHorasExtraDeHoy();

    const horasExtraAprobadas = Array.from(horasExtraPorEmpleado.values())
      .filter((solicitud) => solicitud.estado === 'aprobada')
      .reduce(
        (total, solicitud) => total + (solicitud.minutos_autorizados ?? 0),
        0,
      );

    const ausencias = !jornadaHoy.esLaborable
      ? 0
      : Math.max(
          empleadosContablesParaAusencia.length -
            presentesContablesParaAusencia.size,
          0,
        );

    return {
      kpis: {
        presentes: presentes.size,
        retardos: retardos.length,
        enComida: empleadosEnComida.length,
        excedidosComida: excedidosComida.length,
        ausencias,
        horasExtraAprobadas,
      },
      puntualidadSemanal: await this.getPuntualidadSemanal(
        empleadosActivosHoyIds,
      ),
      incidencias: this.getIncidencias(
        registrosHoyActivos,
        horasExtraPorEmpleado,
      ),
    };
  }

  private getIncidencias(
    registrosHoy: RegistroAcceso[],
    horasExtraPorEmpleado: Map<number, Partial<SolicitudHoraExtra>> = new Map(),
  ) {
    return registrosHoy
      .filter(
        (registro) =>
          registro.estatus_registro === 'retardo' ||
          registro.estatus_registro === 'fuera_de_rango' ||
          registro.estatus_registro === 'antes_de_tiempo',
      )
      .map((registro) => ({
        id_registro: registro.id_registro,
        empleado: registro.empleado
          ? `${registro.empleado.nombre} ${registro.empleado.apellido_paterno}`
          : `Empleado ${registro.id_empleado}`,
        tipo: registro.estatus_registro,
        detalle:
          registro.estatus_registro === 'retardo'
            ? 'Entrada con retardo'
            : registro.estatus_registro === 'antes_de_tiempo'
              ? 'Salida antes de tiempo'
              : 'Salida fuera de rango',
        fecha_y_hora: this.formatDateTimeLocal(registro.fecha_y_hora),
        horasExtra: horasExtraPorEmpleado.get(registro.id_empleado) ?? null,
      }));
  }

  private async obtenerHorasExtraDeHoy(): Promise<
    Map<number, Partial<SolicitudHoraExtra>>
  > {
    const solicitudes = await this.solicitudHoraExtraRepository.find({
      where: {
        activo: true,
        fecha_trabajo: this.formatFechaKey(new Date()),
      },
      select: {
        id_empleado: true,
        minutos_solicitados: true,
        minutos_autorizados: true,
        estado: true,
      },
    });

    return new Map(
      solicitudes.map((solicitud) => [
        solicitud.id_empleado,
        {
          minutos_solicitados: solicitud.minutos_solicitados,
          minutos_autorizados: solicitud.minutos_autorizados,
          estado: solicitud.estado,
        },
      ]),
    );
  }

  private async getPuntualidadSemanal(empleadosActivosHoyIds: Set<number>) {
    const hoy = new Date();
    const diaSemana = hoy.getDay();

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));
    lunes.setHours(0, 0, 0, 0);

    const domingo = new Date(lunes);
    domingo.setDate(lunes.getDate() + 6);

    const fechaEspecialPorDia = await this.obtenerFechaEspecialEnRango(
      lunes,
      domingo,
    );

    const nombresDias = [
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
      'Domingo',
    ];

    const resultados: { dia: string; aTiempo: number; retardos: number }[] = [];

    for (let index = 0; index < nombresDias.length; index++) {
      const inicioDia = new Date(lunes);
      inicioDia.setDate(lunes.getDate() + index);
      inicioDia.setHours(0, 0, 0, 0);

      const jornada = resolverJornadaPorFecha(
        inicioDia,
        fechaEspecialPorDia.get(this.formatFechaKey(inicioDia)) ?? null,
      );

      if (!jornada.esLaborable) {
        continue;
      }

      const finDia = new Date(inicioDia);
      finDia.setHours(23, 59, 59, 999);

      const registrosDia = await this.registroRepository.find({
        where: {
          tipo_registro: 'entrada',
          fecha_y_hora: Between(inicioDia, finDia),
        },
      });

      const registrosActivosDia = registrosDia.filter((registro) =>
        empleadosActivosHoyIds.has(registro.id_empleado),
      );

      const aTiempo = registrosActivosDia.filter(
        (registro) => registro.estatus_registro === 'a_tiempo',
      ).length;

      const retardos = registrosActivosDia.filter(
        (registro) => registro.estatus_registro === 'retardo',
      ).length;

      resultados.push({
        dia: nombresDias[index],
        aTiempo,
        retardos,
      });
    }

    return resultados;
  }

  private async obtenerFechaEspecialDeHoy(): Promise<FechaEspecial | null> {
    return this.fechaEspecialRepository.findOne({
      where: {
        fecha: this.formatFechaKey(new Date()),
        activo: true,
      },
    });
  }

  private async obtenerFechaEspecialEnRango(
    desde: Date,
    hasta: Date,
  ): Promise<Map<string, FechaEspecial>> {
    const fechaEspeciales = await this.fechaEspecialRepository.find({
      where: {
        activo: true,
        fecha: Between(this.formatFechaKey(desde), this.formatFechaKey(hasta)),
      },
    });

    return new Map(
      fechaEspeciales.map((fechaEspecial) => [
        fechaEspecial.fecha,
        fechaEspecial,
      ]),
    );
  }

  private formatFechaKey(fecha: Date) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private obtenerRangoDiaActual() {
    const ahora = new Date();

    const inicioDia = new Date(ahora);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(ahora);
    finDia.setHours(23, 59, 59, 999);

    return { inicioDia, finDia };
  }

  private formatDateTimeLocal(fecha: Date) {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    const hour = String(fecha.getHours()).padStart(2, '0');
    const minute = String(fecha.getMinutes()).padStart(2, '0');
    const second = String(fecha.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  }
}
