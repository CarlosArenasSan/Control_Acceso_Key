import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, MoreThanOrEqual, Repository } from 'typeorm';
import { SolicitudHoraExtra } from '../entities/solicitud-hora-extra.entity';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import { Empleado } from '../entities/empleado.entity';
import type { JwtPayload } from '../guards/jwt-auth.guard';
import {
  CreateSolicitudHoraExtraDto,
  ResponderSolicitudHoraExtraDto,
} from '../dto/solicitud-hora-extra.dto';

const LIMITE_DIAS_SEMANALES = 4;
const MINUTOS_BLOQUEO_RECHAZO = 30;

interface MySqlError {
  code?: string;
}

@Injectable()
export class SolicitudHoraExtraService {
  constructor(
    @InjectRepository(SolicitudHoraExtra)
    private readonly solicitudRepository: Repository<SolicitudHoraExtra>,
    @InjectRepository(FechaEspecial)
    private readonly fechaEspecialRepository: Repository<FechaEspecial>,
    private readonly dataSource: DataSource,
  ) {}

  async create(user: JwtPayload, dto: CreateSolicitudHoraExtraDto) {
    await this.validarFechaTrabajo(user.id, dto.fecha_trabajo);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const solicitudRepo = manager.getRepository(SolicitudHoraExtra);

        const empleado = await manager.findOne(Empleado, {
          where: { id_empleado: user.id },
          lock: { mode: 'pessimistic_write' },
        });

        if (!empleado) {
          throw new BadRequestException('El empleado no existe.');
        }

        await this.validarDiasDisponibles(
          solicitudRepo,
          user.id,
          dto.fecha_trabajo,
        );

        const existente = await solicitudRepo.findOne({
          where: {
            id_empleado: user.id,
            fecha_trabajo: dto.fecha_trabajo,
          },
        });

        if (
          existente?.estado === 'pendiente' ||
          existente?.estado === 'aprobada'
        ) {
          throw new BadRequestException(
            'Ya tienes una solicitud vigente para esta fecha.',
          );
        }

        if (existente) {
          existente.minutos_solicitados = dto.minutos_solicitados;
          existente.motivo = dto.motivo.trim();
          existente.estado = 'pendiente';
          existente.minutos_autorizados = null;
          existente.comentario_respuesta = null;
          existente.id_admin_respuesta = null;
          existente.fecha_solicitud = new Date();
          existente.fecha_respuesta = null;
          existente.activo = true;

          return solicitudRepo.save(existente);
        }

        const solicitud = solicitudRepo.create({
          id_empleado: user.id,
          fecha_trabajo: dto.fecha_trabajo,
          minutos_solicitados: dto.minutos_solicitados,
          motivo: dto.motivo.trim(),
          estado: 'pendiente',
          minutos_autorizados: null,
          comentario_respuesta: null,
          id_admin_respuesta: null,
          fecha_respuesta: null,
          activo: true,
        });

        return solicitudRepo.save(solicitud);
      });
    } catch (error) {
      const mysqlError = error as MySqlError;

      if (mysqlError.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException(
          'Ya tienes una solicitud para esta fecha.',
        );
      }

      throw error;
    }
  }

  async respond(
    id: number,
    dto: ResponderSolicitudHoraExtraDto,
    idAdmin: number,
  ) {
    const solicitud = await this.solicitudRepository.findOne({
      where: { id_solicitud: id, activo: true },
    });

    if (!solicitud) {
      throw new BadRequestException('La solicitud no existe.');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(
        'Solo se pueden responder solicitudes pendientes.',
      );
    }

    if (dto.estado === 'aprobada') {
      if (!dto.minutos_autorizados) {
        throw new BadRequestException('Debes indicar los minutos autorizados.');
      }

      if (dto.minutos_autorizados > solicitud.minutos_solicitados) {
        throw new BadRequestException(
          'Los minutos autorizados no pueden superar los minutos solicitados.',
        );
      }

      solicitud.estado = 'aprobada';
      solicitud.minutos_autorizados = dto.minutos_autorizados;
    } else {
      if (!dto.comentario_respuesta?.trim()) {
        throw new BadRequestException(
          'Debes indicar un comentario al rechazar la solicitud.',
        );
      }

      solicitud.estado = 'rechazada';
      solicitud.minutos_autorizados = null;
    }

    solicitud.comentario_respuesta = dto.comentario_respuesta?.trim() || null;
    solicitud.id_admin_respuesta = idAdmin;
    solicitud.fecha_respuesta = new Date();

    return this.solicitudRepository.save(solicitud);
  }

  async cancel(id: number, user: JwtPayload) {
    const solicitud = await this.solicitudRepository.findOne({
      where: {
        id_solicitud: id,
        id_empleado: user.id,
        activo: true,
      },
    });

    if (!solicitud) {
      throw new BadRequestException('La solicitud no existe.');
    }

    if (solicitud.estado !== 'pendiente') {
      throw new BadRequestException(
        'Solo puedes cancelar solicitudes pendientes.',
      );
    }

    solicitud.estado = 'cancelada';
    solicitud.fecha_respuesta = new Date();

    return this.solicitudRepository.save(solicitud);
  }

  async getSaldo(idEmpleado: number) {
    const solicitudes = await this.obtenerSolicitudesSemanales(
      this.solicitudRepository,
      idEmpleado,
      this.formatLocalDateKey(new Date()),
    );

    const solicitudesVigentes = solicitudes.filter(
      (solicitud) =>
        solicitud.estado === 'pendiente' || solicitud.estado === 'aprobada',
    );

    const minutosAprobados = solicitudes
      .filter((solicitud) => solicitud.estado === 'aprobada')
      .reduce(
        (total, solicitud) => total + (solicitud.minutos_autorizados ?? 0),
        0,
      );

    const minutosPendientes = solicitudes
      .filter((solicitud) => solicitud.estado === 'pendiente')
      .reduce((total, solicitud) => total + solicitud.minutos_solicitados, 0);

    return {
      limite_dias: LIMITE_DIAS_SEMANALES,
      dias_ocupados: solicitudesVigentes.length,
      dias_disponibles: Math.max(
        LIMITE_DIAS_SEMANALES - solicitudesVigentes.length,
        0,
      ),
      minutos_aprobados: minutosAprobados,
      minutos_pendientes: minutosPendientes,
    };
  }

  findMine(idEmpleado: number) {
    return this.solicitudRepository.find({
      where: {
        id_empleado: idEmpleado,
        activo: true,
        fecha_trabajo: MoreThanOrEqual(this.obtenerInicioSemanaActual()),
      },
      order: { fecha_solicitud: 'DESC' },
    });
  }

  findAll() {
    return this.solicitudRepository.find({
      where: {
        activo: true,
        fecha_trabajo: MoreThanOrEqual(this.obtenerInicioSemanaActual()),
      },
      relations: {
        empleado: true,
        administrador: true,
      },
      order: { fecha_solicitud: 'DESC' },
    });
  }

  private obtenerInicioSemanaActual() {
    const hoy = new Date();
    const diaSemana = hoy.getDay();

    const lunes = new Date(hoy);
    lunes.setDate(hoy.getDate() - ((diaSemana + 6) % 7));

    return this.formatLocalDateKey(lunes);
  }

  async obtenerMinutosAutorizados(
    idEmpleado: number,
    fechaTrabajo: string,
  ): Promise<number> {
    const solicitud = await this.solicitudRepository.findOne({
      where: {
        id_empleado: idEmpleado,
        fecha_trabajo: fechaTrabajo,
        estado: 'aprobada',
        activo: true,
      },
    });

    return solicitud?.minutos_autorizados ?? 0;
  }

  private async validarFechaTrabajo(idEmpleado: number, fechaTrabajo: string) {
    const hoyKey = this.formatLocalDateKey(new Date());

    if (fechaTrabajo < hoyKey) {
      throw new BadRequestException(
        'No puedes solicitar horas extra para fechas pasadas.',
      );
    }

    const fecha = this.parseLocalDate(fechaTrabajo);
    const diaSemana = fecha.getDay();

    if (diaSemana === 6) {
      throw new BadRequestException(
        'Los sábados son jornada de media jornada y no se permiten horas extra.',
      );
    }

    if (diaSemana === 0) {
      throw new BadRequestException(
        'El domingo no es un día laborable y no se permiten horas extra.',
      );
    }

    const fechaEspecial = await this.fechaEspecialRepository.findOne({
      where: {
        fecha: fechaTrabajo,
        activo: true,
      },
    });

    if (fechaEspecial) {
      throw new BadRequestException(
        `El día ${fechaTrabajo} está registrado como fecha especial (${fechaEspecial.nombre}) y no se permiten horas extra.`,
      );
    }

    const rechazo = await this.solicitudRepository.findOne({
      where: {
        id_empleado: idEmpleado,
        fecha_trabajo: fechaTrabajo,
        estado: 'rechazada',
        activo: true,
      },
    });

    if (rechazo?.fecha_respuesta) {
      const minutosDesdeRechazo =
        (Date.now() - rechazo.fecha_respuesta.getTime()) / 60000;

      if (minutosDesdeRechazo < MINUTOS_BLOQUEO_RECHAZO) {
        throw new BadRequestException(
          'Tu solicitud para esta fecha fue rechazada. Revisa el comentario del administrador y vuelve a intentarlo después de 30 minutos.',
        );
      }
    }
  }

  private async validarDiasDisponibles(
    repository: Repository<SolicitudHoraExtra>,
    idEmpleado: number,
    fechaTrabajo: string,
  ) {
    const solicitudes = await this.obtenerSolicitudesSemanales(
      repository,
      idEmpleado,
      fechaTrabajo,
    );

    const diasOcupados = solicitudes.filter(
      (solicitud) =>
        solicitud.estado === 'pendiente' || solicitud.estado === 'aprobada',
    ).length;

    if (diasOcupados >= LIMITE_DIAS_SEMANALES) {
      throw new BadRequestException(
        'Ya utilizaste los 4 días disponibles de horas extra esta semana.',
      );
    }
  }

  private async obtenerSolicitudesSemanales(
    repository: Repository<SolicitudHoraExtra>,
    idEmpleado: number,
    fechaTrabajo: string,
  ) {
    const { inicio, fin } = this.obtenerRangoSemana(
      this.parseLocalDate(fechaTrabajo),
    );

    return repository.find({
      where: {
        id_empleado: idEmpleado,
        activo: true,
        fecha_trabajo: Between(inicio, fin),
      },
    });
  }

  private obtenerRangoSemana(fecha: Date) {
    const diaSemana = fecha.getDay();

    const lunes = new Date(fecha);
    lunes.setDate(fecha.getDate() - ((diaSemana + 6) % 7));

    const sabado = new Date(lunes);
    sabado.setDate(lunes.getDate() + 5);

    return {
      inicio: this.formatLocalDateKey(lunes),
      fin: this.formatLocalDateKey(sabado),
    };
  }

  private parseLocalDate(value: string) {
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
