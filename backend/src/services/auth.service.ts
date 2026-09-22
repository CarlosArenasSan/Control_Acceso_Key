import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Administrador } from '../entities/administrador.entity';
import { Empleado } from '../entities/empleado.entity';

interface LoginDto {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Administrador)
    private readonly administradorRepository: Repository<Administrador>,
    @InjectRepository(Empleado)
    private readonly empleadoRepository: Repository<Empleado>,
    private readonly jwtService: JwtService,
  ) {}

  async login(data: LoginDto) {
    const { username, password } = data;

    if (!username || !password) {
      throw new UnauthorizedException('Faltan credenciales');
    }

    const admin = await this.administradorRepository
      .createQueryBuilder('administrador')
      .addSelect('administrador.password_hash')
      .where('administrador.username = :username', { username })
      .getOne();

    if (admin) {
      return this.loginAdmin(admin, password);
    }

    return this.loginEmpleado(username, password);
  }

  private async loginAdmin(admin: Administrador, password: string) {
    if (!admin.password_hash) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const passwordValid = await bcrypt.compare(password, admin.password_hash);

    if (!passwordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const user = {
      id: admin.id_admin,
      username: admin.username,
      role: 'admin' as const,
      fullName: admin.username,
    };

    const token = this.jwtService.sign(user);

    return { token, user };
  }

  private async loginEmpleado(username: string, password: string) {
    const empleado = await this.empleadoRepository
      .createQueryBuilder('empleado')
      .addSelect('empleado.password_hash')
      .where('empleado.username = :username', { username })
      .getOne();

    if (!empleado || !empleado.password_hash) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    if (!empleado.activo) {
      throw new UnauthorizedException(
        'El empleado está inactivo. Contacta al administrador.',
      );
    }

    const passwordValid = await bcrypt.compare(
      password,
      empleado.password_hash,
    );

    if (!passwordValid) {
      throw new UnauthorizedException('Usuario o contraseña incorrectos');
    }

    const user = {
      id: empleado.id_empleado,
      username: empleado.username,
      role: 'empleado' as const,
      fullName: `${empleado.nombre} ${empleado.apellido_paterno} ${
        empleado.apellido_materno ?? ''
      }`.trim(),
    };

    const token = this.jwtService.sign(user);

    return { token, user };
  }
}
