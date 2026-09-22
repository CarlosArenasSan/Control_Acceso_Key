import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FechaEspecial } from '../entities/fecha-especial.entity';
import {
  CreateFechaEspecialDto,
  TipoJornada,
  UpdateFechaEspecialDto,
} from '../dto/fecha-especial.dto';

const HORARIOS_JORNADA: Record<
  TipoJornada,
  {
    hora_inicio_entrada: string | null;
    hora_fin_entrada: string | null;
    hora_inicio_salida: string | null;
    hora_fin_salida: string | null;
    requiere_comida: boolean;
  }
> = {
  jornada_completa: {
    hora_inicio_entrada: '08:50:00',
    hora_fin_entrada: '09:10:00',
    hora_inicio_salida: '18:30:00',
    hora_fin_salida: '19:10:00',
    requiere_comida: true,
  },
  media_jornada: {
    hora_inicio_entrada: '08:50:00',
    hora_fin_entrada: '09:10:00',
    hora_inicio_salida: '13:30:00',
    hora_fin_salida: '14:10:00',
    requiere_comida: false,
  },
  no_laborable: {
    hora_inicio_entrada: null,
    hora_fin_entrada: null,
    hora_inicio_salida: null,
    hora_fin_salida: null,
    requiere_comida: false,
  },
};

@Injectable()
export class FechaEspecialService {
  constructor(
    @InjectRepository(FechaEspecial)
    private readonly fechaRepository: Repository<FechaEspecial>,
  ) {}

  findAll() {
    return this.fechaRepository.find({
      order: { fecha: 'DESC' },
    });
  }

  async create(data: CreateFechaEspecialDto, idAdmin: number) {
    const existe = await this.fechaRepository.findOne({
      where: { fecha: data.fecha },
    });

    if (existe) {
      throw new BadRequestException(
        'Ya existe una fecha especial para este día. Edita y reactiva el registro existente.',
      );
    }

    const horario = HORARIOS_JORNADA[data.tipo_jornada];

    const fecha = this.fechaRepository.create({
      fecha: data.fecha,
      nombre: data.nombre.trim(),
      tipo_jornada: data.tipo_jornada,
      observaciones: data.observaciones?.trim() || null,
      activo: data.activo ?? true,
      id_admin: idAdmin,
      ...horario,
    });

    return this.fechaRepository.save(fecha);
  }

  async update(id: number, data: UpdateFechaEspecialDto) {
    const fecha = await this.fechaRepository.findOne({
      where: { id_fecha_especial: id },
    });

    if (!fecha) {
      throw new BadRequestException('La fecha especial no existe.');
    }

    if (data.nombre !== undefined) {
      fecha.nombre = data.nombre.trim();
    }

    if (data.observaciones !== undefined) {
      fecha.observaciones = data.observaciones.trim() || null;
    }

    if (data.tipo_jornada !== undefined) {
      fecha.tipo_jornada = data.tipo_jornada;
      const horario = HORARIOS_JORNADA[data.tipo_jornada];
      fecha.hora_inicio_entrada = horario.hora_inicio_entrada;
      fecha.hora_fin_entrada = horario.hora_fin_entrada;
      fecha.hora_inicio_salida = horario.hora_inicio_salida;
      fecha.hora_fin_salida = horario.hora_fin_salida;
      fecha.requiere_comida = horario.requiere_comida;
    }

    return this.fechaRepository.save(fecha);
  }

  async updateStatus(id: number, activo: boolean) {
    const fecha = await this.fechaRepository.findOne({
      where: { id_fecha_especial: id },
    });

    if (!fecha) {
      throw new BadRequestException('La fecha especial no existe.');
    }

    fecha.activo = activo;

    return this.fechaRepository.save(fecha);
  }
}
