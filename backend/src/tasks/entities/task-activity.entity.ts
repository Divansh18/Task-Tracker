import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';
import { TaskActivityType } from '../enums/task-activity-type.enum';

@Entity({ name: 'task_activity_logs' })
@Index(['task'])
export class TaskActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Task, (task) => task.activities, { onDelete: 'CASCADE' })
  task!: Task;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  actor?: User | null;

  @Column({ type: 'enum', enum: TaskActivityType })
  type!: TaskActivityType;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, unknown> | null;

  @CreateDateColumn()
  createdAt!: Date;
}


