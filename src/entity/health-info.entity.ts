import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('Health_Info')
export class HealthInfo {
  @PrimaryGeneratedColumn()
  public health_info_id: number;

  @Column({ type: 'int', nullable: false, unique: false })
  public height_m: number;

  @Column({ type: 'int', nullable: false, unique: false })
  public weight_kg: number;

  @Column({ type: 'varchar', length: 45, nullable: false, unique: false })
  public physical_activity_level: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: false })
  public current_diet: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: false })
  public allergic_food: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: false })
  public chronic_disease: string;

  @Column({ type: 'varchar', length: 255, nullable: true, unique: false })
  public expected_diet: string;

  @CreateDateColumn({
    type: 'datetime',
    nullable: false,
    unique: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  public created_at: Date;
}
