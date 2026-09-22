import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('empleado')
export class Empleado {
  @PrimaryColumn({ type: 'int' })
  id_empleado!: number;

  @Column({ type: 'varchar', length: 100 })
  nombre!: string;

  @Column({ type: 'varchar', length: 100 })
  apellido_paterno!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  apellido_materno!: string | null;

  @Column({ type: 'varchar', length: 50, unique: true })
  username!: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password_hash!: string;

  @Column({ type: 'boolean', default: true })
  activo!: boolean;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
