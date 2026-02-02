import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'daily_reflections' })
@Unique(['user', 'reflectDate'])
@Index(['reflectDate'])
export class DailyReflection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.reflections, { onDelete: 'CASCADE' })
  user!: User;

  @Column({ type: 'date' })
  reflectDate!: string;

  @Column({ type: 'text', nullable: true })
  wentWell?: string | null;

  @Column({ type: 'text', nullable: true })
  blockers?: string | null;

  @Column({ type: 'text', nullable: true })
  winOfDay?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}


