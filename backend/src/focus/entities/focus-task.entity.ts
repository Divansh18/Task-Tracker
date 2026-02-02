import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

@Entity({ name: 'focus_tasks' })
@Unique(['user', 'focusDate', 'task'])
@Index(['user', 'focusDate'])
export class FocusTask {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Task, (task) => task.focusAssignments, { onDelete: 'CASCADE' })
  task!: Task;

  @Column({ type: 'date' })
  focusDate!: string;

  @Column({ type: 'int', default: 0 })
  position!: number;

  @CreateDateColumn()
  createdAt!: Date;
}


