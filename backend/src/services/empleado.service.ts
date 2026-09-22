import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Empleado } from '../entities/empleado.entity';
import { RegistroAcceso } from '../entities/registro-acceso.entity';
import { CreateEmpleadoDto, UpdateEmpleadoDto } from '../dto/empleado.dto';

@Injectable()
export class EmpleadoService {
  constructor(
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    @InjectRepository(RegistroAcceso)
    private readonly registroRepository: Repository<RegistroAcceso>,
  ) {}

  findAll() {
    return this.empleadoRepository.find({
      order: { id_empleado: 'ASC' },
    });
  }

  async create(data: CreateEmpleadoDto) {
    const exists = await this.empleadoRepository.findOne({
      where: { id_empleado: data.id_empleado },
    });

    if (exists) {
      throw new BadRequestException('Ya existe un empleado con ese ID.');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const empleado = this.empleadoRepository.create({
      id_empleado: data.id_empleado,
      nombre: data.nombre,
      apellido_paterno: data.apellido_paterno,
      apellido_materno: data.apellido_materno || null,
      username: data.username,
      password_hash: passwordHash,
      activo: data.activo ?? true,
    });

    return this.empleadoRepository.save(empleado);
  }

  async update(id: number, data: UpdateEmpleadoDto) {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado: id },
    });

    if (!empleado) {
      throw new BadRequestException('El empleado no existe.');
    }

    empleado.nombre = data.nombre;
    empleado.apellido_paterno = data.apellido_paterno;
    empleado.apellido_materno = data.apellido_materno || null;
    empleado.username = data.username;
    empleado.activo = data.activo;

    if (data.password?.trim()) {
      empleado.password_hash = await bcrypt.hash(data.password, 10);
    }

    return this.empleadoRepository.save(empleado);
  }

  async delete(id: number) {
    const empleado = await this.empleadoRepository.findOne({
      where: { id_empleado: id },
    });

    if (!empleado) {
      throw new BadRequestException('El empleado no existe.');
    }

    const totalRegistros = await this.registroRepository.count({
      where: { id_empleado: id },
    });

    if (totalRegistros === 0) {
      await this.empleadoRepository.remove(empleado);

      return {
        message: 'Empleado eliminado correctamente.',
      };
    }

    empleado.activo = false;

    await this.empleadoRepository.save(empleado);

    return {
      message: 'Empleado desactivado correctamente.',
    };
  }
}
