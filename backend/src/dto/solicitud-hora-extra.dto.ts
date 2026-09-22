import {
  IsDateString,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';

const ESTADOS_RESPUESTA = ['aprobada', 'rechazada'] as const;
const MINUTOS_VALIDOS = [60, 120, 180] as const;

export type EstadoRespuesta = (typeof ESTADOS_RESPUESTA)[number];

export class CreateSolicitudHoraExtraDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'La fecha debe tener el formato YYYY-MM-DD.',
  })
  @IsDateString({}, { message: 'La fecha no es válida.' })
  fecha_trabajo!: string;

  @Type(() => Number)
  @IsInt({ message: 'Las horas solicitadas no son válidas.' })
  @IsIn(MINUTOS_VALIDOS, {
    message: 'Solo puedes solicitar 1, 2 o 3 horas extra.',
  })
  minutos_solicitados!: number;

  @IsString({ message: 'El motivo debe ser texto.' })
  @Length(1, 500, {
    message: 'El motivo debe tener entre 1 y 500 caracteres.',
  })
  motivo!: string;
}

export class ResponderSolicitudHoraExtraDto {
  @IsIn(ESTADOS_RESPUESTA, {
    message: 'El estado solo puede ser aprobada o rechazada.',
  })
  estado!: EstadoRespuesta;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Las horas autorizadas no son válidas.' })
  @IsIn(MINUTOS_VALIDOS, {
    message: 'Solo puedes autorizar 1, 2 o 3 horas extra.',
  })
  minutos_autorizados?: number;

  @IsOptional()
  @IsString({ message: 'El comentario debe ser texto.' })
  @Length(0, 500, {
    message: 'El comentario no puede superar los 500 caracteres.',
  })
  comentario_respuesta?: string;
}
