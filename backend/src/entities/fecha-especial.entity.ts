import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Administrador } from './administrador.entity';

type TipoJornada = 'jornada_completa' | 'media_jornada' | 'no_laborable';

@Entity('fecha_especial')
export class FechaEspecial {
  @PrimaryGeneratedColumn()
  id_fecha_especial!: number;

  @Column({ type: 'date', unique: true })
  fecha!: string;

  @Column({ type: 'varchar', length: 255 })
  nombre!: string;

  @Column({
    type: 'enum',
    enum: ['jornada_completa', 'media_jornada', 'no_laborable'],
  })
  tipo_jornada!: TipoJornada;

  @Column({ type: 'time', nullable: true })
  hora_inicio_entrada!: string | null;

  @Column({ type: 'time', nullable: true })
  hora_fin_entrada!: string | null;

  @Column({ type: 'time', nullable: true })
  hora_inicio_salida!: string | null;

  @Column({ type: 'time', nullable: true })
  hora_fin_salida!: string | null;

  @Column({ type: 'boolean', default: true })
  requiere_comida!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  observaciones!: string | null;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'int' })
  id_admin!: number;

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

  @ManyToOne(() => Administrador, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'id_admin' })
  administrador!: Administrador;
}
