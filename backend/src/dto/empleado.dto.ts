import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateEmpleadoDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID del empleado debe ser un número entero.' })
  @Min(1, { message: 'El ID del empleado debe ser mayor a 0.' })
  id_empleado!: number;

  @IsString({ message: 'El nombre debe ser texto.' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' })
  nombre!: string;

  @IsString({ message: 'El apellido paterno debe ser texto.' })
  @Length(1, 100, {
    message: 'El apellido paterno debe tener entre 1 y 100 caracteres.',
  })
  apellido_paterno!: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser texto.' })
  @Length(0, 100, {
    message: 'El apellido materno no puede exceder 100 caracteres.',
  })
  apellido_materno?: string;

  @IsString({ message: 'El usuario debe ser texto.' })
  @Length(3, 50, {
    message: 'El usuario debe tener entre 3 y 50 caracteres.',
  })
  username!: string;

  @IsString({ message: 'La contraseña debe ser texto.' })
  @Length(8, 100, {
    message: 'La contraseña debe tener mínimo 8 caracteres.',
  })
  password!: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo?: boolean;
}

export class UpdateEmpleadoDto {
  @IsString({ message: 'El nombre debe ser texto.' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' })
  nombre!: string;

  @IsString({ message: 'El apellido paterno debe ser texto.' })
  @Length(1, 100, {
    message: 'El apellido paterno debe tener entre 1 y 100 caracteres.',
  })
  apellido_paterno!: string;

  @IsOptional()
  @IsString({ message: 'El apellido materno debe ser texto.' })
  @Length(0, 100, {
    message: 'El apellido materno no puede exceder 100 caracteres.',
  })
  apellido_materno?: string;

  @IsString({ message: 'El usuario debe ser texto.' })
  @Length(3, 50, {
    message: 'El usuario debe tener entre 3 y 50 caracteres.',
  })
  username!: string;

  @IsOptional()
  @IsString({ message: 'La contraseña debe ser texto.' })
  @Length(1, 100, {
    message: 'La contraseña debe tener mínimo 8 caracteres.',
  })
  password?: string;

  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo!: boolean;
}
