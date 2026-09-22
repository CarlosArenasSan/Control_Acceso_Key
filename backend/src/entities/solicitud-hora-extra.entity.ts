import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empleado } from './empleado.entity';
import { Administrador } from './administrador.entity';

type EstadoSolicitud = 'pendiente' | 'aprobada' | 'rechazada' | 'cancelada';

@Entity('solicitud_hora_extra')
export class SolicitudHoraExtra {
  @PrimaryGeneratedColumn()
  id_solicitud!: number;

  @Column({ type: 'int' })
  id_empleado!: number;

  @Column({ type: 'date' })
  fecha_trabajo!: string;

  @Column({ type: 'smallint', unsigned: true })
  minutos_solicitados!: number;

  @Column({ type: 'varchar', length: 500 })
  motivo!: string;

  @Column({
    type: 'enum',
    enum: ['pendiente', 'aprobada', 'rechazada', 'cancelada'],
    default: 'pendiente',
  })
  estado!: EstadoSolicitud;

  @Column({ type: 'smallint', unsigned: true, nullable: true })
  minutos_autorizados!: number | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  comentario_respuesta!: string | null;

  @Column({ type: 'int', nullable: true })
  id_admin_respuesta!: number | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_solicitud!: Date;

  @Column({ type: 'datetime', nullable: true })
  fecha_respuesta!: Date | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @Column({
    type: 'datetime',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @ManyToOne(() => Empleado, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_empleado' })
  empleado!: Empleado;

  @ManyToOne(() => Administrador, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_admin_respuesta' })
  administrador!: Administrador | null;
}
