import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('punto_autorizado')
export class PuntoAutorizado {
  @PrimaryGeneratedColumn()
  id_punto!: number;

  @Column({ length: 100 })
  nombre!: string;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitud!: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitud!: number;

  @Column({ type: 'int', default: 250 })
  radio_metros!: number;

  @Column({ type: 'varchar', length: 255 })
  direccion_fija!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
