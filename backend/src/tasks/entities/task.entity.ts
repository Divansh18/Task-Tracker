import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskEnergyLevel } from '../enums/task-energy-level.enum';
import { TaskSubtask } from './task-subtask.entity';
import { TaskComment } from './task-comment.entity';
import { TaskActivityLog } from './task-activity.entity';
import { FocusTask } from '../../focus/entities/focus-task.entity';

@Entity({ name: 'tasks' })
@Index(['status'])
@Index(['priority'])
@Index(['title'])
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date | null;

  @Column({ type: 'enum', enum: TaskPriority, default: TaskPriority.Medium })
  priority!: TaskPriority;

  @Column({ type: 'enum', enum: TaskStatus, default: TaskStatus.Todo })
  status!: TaskStatus;

  @Column({ type: 'enum', enum: TaskEnergyLevel, default: TaskEnergyLevel.Medium })
  energyLevel!: TaskEnergyLevel;

  @Column({ type: 'int', nullable: true })
  estimatedMinutes?: number | null;

  @Column({ type: 'datetime', nullable: true })
  completedAt?: Date | null;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  user!: User;

  @OneToMany(() => TaskSubtask, (subtask) => subtask.task, {
    cascade: true,
  })
  subtasks!: TaskSubtask[];

  @OneToMany(() => TaskComment, (comment) => comment.task, {
    cascade: ['remove'],
  })
  comments!: TaskComment[];

  @OneToMany(() => TaskActivityLog, (activity) => activity.task, {
    cascade: ['remove'],
  })
  activities!: TaskActivityLog[];

  @OneToMany(() => FocusTask, (focusTask) => focusTask.task, {
    cascade: ['remove'],
  })
  focusAssignments!: FocusTask[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
