import {
  IsBoolean,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePuntoAutorizadoDto {
  @IsString({ message: 'El nombre debe ser texto.' })
  @Length(1, 100, { message: 'El nombre debe tener entre 1 y 100 caracteres.' })
  nombre!: string;

  @Type(() => Number)
  @IsLatitude({ message: 'La latitud no es válida.' })
  latitud!: number;

  @Type(() => Number)
  @IsLongitude({ message: 'La longitud no es válida.' })
  longitud!: number;

  @Type(() => Number)
  @IsInt({ message: 'El radio debe ser un número entero.' })
  @Min(1, { message: 'El radio debe ser mayor a 0 metros.' })
  @Max(10000, { message: 'El radio no puede ser mayor a 10,000 metros.' })
  radio_metros!: number;

  @IsString({ message: 'La dirección debe ser texto.' })
  @Length(1, 255, {
    message: 'La dirección debe tener entre 1 y 255 caracteres.',
  })
  direccion_fija!: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo?: boolean;
}

export class UpdatePuntoStatusDto {
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo!: boolean;
}

export class ResolveLocationDto {
  @Type(() => Number)
  @IsLatitude({ message: 'La latitud no es válida.' })
  latitud!: number;

  @Type(() => Number)
  @IsLongitude({ message: 'La longitud no es válida.' })
  longitud!: number;
}
