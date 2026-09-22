import {
  IsDateString,
  IsEnum,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum TipoRegistroDto {
  ENTRADA = 'entrada',
  SALIDA = 'salida',
  SALIDA_COMIDA = 'salida_comida',
  REGRESO_COMIDA = 'regreso_comida',
}

export enum TipoDireccionManualDto {
  MANUAL = 'manual',
  PUNTO = 'punto',
}

export class CreateRegistroAccesoDto {
  @IsEnum(TipoRegistroDto, {
    message:
      'El tipo de registro debe ser entrada, salida, salida_comida o regreso_comida.',
  })
  tipo_registro!: TipoRegistroDto;

  @Type(() => Number)
  @IsLatitude({ message: 'La latitud no es válida.' })
  latitud!: number;

  @Type(() => Number)
  @IsLongitude({ message: 'La longitud no es válida.' })
  longitud!: number;
}

export class CreateRegistroManualDto {
  @Type(() => Number)
  @IsInt({ message: 'El ID del empleado debe ser un número entero.' })
  @Min(1, { message: 'El ID del empleado debe ser mayor a 0.' })
  id_empleado!: number;

  @IsEnum(TipoRegistroDto, {
    message:
      'El tipo de registro debe ser entrada, salida, salida_comida o regreso_comida.',
  })
  tipo_registro!: TipoRegistroDto;

  @IsDateString({}, { message: 'La fecha no es válida.' })
  fecha!: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/, {
    message: 'La hora debe tener formato HH:mm.',
  })
  hora!: string;

  @IsEnum(TipoDireccionManualDto, {
    message: 'El tipo de dirección debe ser manual o punto.',
  })
  tipo_direccion!: TipoDireccionManualDto;

  @ValidateIf(
    (body: CreateRegistroManualDto) =>
      body.tipo_direccion === TipoDireccionManualDto.PUNTO,
  )
  @Type(() => Number)
  @IsInt({ message: 'El punto autorizado debe ser un número entero.' })
  @Min(1, { message: 'Selecciona un punto autorizado válido.' })
  id_punto?: number;

  @ValidateIf(
    (body: CreateRegistroManualDto) =>
      body.tipo_direccion === TipoDireccionManualDto.MANUAL,
  )
  @IsString({ message: 'La dirección manual debe ser texto.' })
  @Length(1, 255, {
    message: 'La dirección manual debe tener entre 1 y 255 caracteres.',
  })
  direccion_manual?: string;

  @IsOptional()
  @IsString({ message: 'La observación debe ser texto.' })
  @Length(0, 255, {
    message: 'La observación no puede exceder 255 caracteres.',
  })
  observacion?: string;
}
