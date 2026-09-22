import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('administrador')
export class Administrador {
  @PrimaryGeneratedColumn()
  id_admin!: number;

  @Column({ length: 50, unique: true })
  username!: string;

  @Column({ length: 255, select: false })
  password_hash!: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;
}
