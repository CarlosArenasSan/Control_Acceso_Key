import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Empleado } from './empleado.entity';

type TipoRegistro = 'entrada' | 'salida' | 'salida_comida' | 'regreso_comida';
type EstatusRegistro =
  | 'a_tiempo'
  | 'retardo'
  | 'fuera_de_rango'
  | 'antes_de_tiempo';

@Entity('registro_de_acceso')
export class RegistroAcceso {
  @PrimaryGeneratedColumn()
  id_registro!: number;

  @Column({ type: 'longblob', nullable: true, select: false })
  fotografia!: Buffer | null;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud!: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  direccion!: string | null;

  @Column({
    type: 'enum',
    enum: ['entrada', 'salida', 'salida_comida', 'regreso_comida'],
  })
  tipo_registro!: TipoRegistro;

  @Column({
    type: 'enum',
    enum: ['a_tiempo', 'retardo', 'fuera_de_rango', 'antes_de_tiempo'],
    nullable: true,
  })
  estatus_registro!: EstatusRegistro | null;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha_y_hora!: Date;

  @Column({ type: 'int' })
  id_empleado!: number;

  @Column({
    type: 'date',
    nullable: true,
    insert: false,
    update: false,
  })
  fecha_registro!: Date | null;

  @ManyToOne(() => Empleado)
  @JoinColumn({ name: 'id_empleado' })
  empleado!: Empleado;
}
