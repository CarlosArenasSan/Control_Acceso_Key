import {
  IsBoolean,
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

const TIPOS_JORNADA = [
  'jornada_completa',
  'media_jornada',
  'no_laborable',
] as const;

export type TipoJornada = (typeof TIPOS_JORNADA)[number];

export class CreateFechaEspecialDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD.',
  })
  @IsDateString({}, { message: 'La fecha no es válida.' })
  fecha!: string;

  @IsString({ message: 'El nombre debe ser texto.' })
  @Length(1, 255, {
    message: 'El nombre debe tener entre 1 y 255 caracteres.',
  })
  nombre!: string;

  @IsIn(TIPOS_JORNADA, { message: 'El tipo de jornada no es válido.' })
  tipo_jornada!: TipoJornada;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto.' })
  @Length(0, 255, {
    message: 'Las observaciones no pueden superar los 255 caracteres.',
  })
  observaciones?: string;

  @IsOptional()
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo?: boolean;
}

export class UpdateFechaEspecialDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser texto.' })
  @Length(1, 255, {
    message: 'El nombre debe tener entre 1 y 255 caracteres.',
  })
  nombre?: string;

  @IsOptional()
  @IsIn(TIPOS_JORNADA, { message: 'El tipo de jornada no es válido.' })
  tipo_jornada?: TipoJornada;

  @IsOptional()
  @IsString({ message: 'Las observaciones deben ser texto.' })
  @Length(0, 255, {
    message: 'Las observaciones no pueden superar los 255 caracteres.',
  })
  observaciones?: string;
}

export class UpdateFechaStatusDto {
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso.' })
  activo!: boolean;
}
