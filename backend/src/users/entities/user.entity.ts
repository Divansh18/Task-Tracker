import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { TaskComment } from '../../tasks/entities/task-comment.entity';
import { TaskActivityLog } from '../../tasks/entities/task-activity.entity';
import { FocusTask } from '../../focus/entities/focus-task.entity';
import { DailyReflection } from '../../reflections/entities/daily-reflection.entity';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  passwordHash!: string;

  @Column({ nullable: true })
  displayName?: string;

  @OneToMany(() => Task, (task) => task.user, { cascade: true })
  tasks!: Task[];

  @OneToMany(() => TaskComment, (comment) => comment.author)
  taskComments!: TaskComment[];

  @OneToMany(() => TaskActivityLog, (activity) => activity.actor)
  taskActivities!: TaskActivityLog[];

  @OneToMany(() => FocusTask, (focusTask) => focusTask.user)
  focusTasks!: FocusTask[];

  @OneToMany(() => DailyReflection, (reflection) => reflection.user)
  reflections!: DailyReflection[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
