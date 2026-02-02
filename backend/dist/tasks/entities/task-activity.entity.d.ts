import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';
import { TaskActivityType } from '../enums/task-activity-type.enum';
export declare class TaskActivityLog {
    id: string;
    task: Task;
    actor?: User | null;
    type: TaskActivityType;
    metadata?: Record<string, unknown> | null;
    createdAt: Date;
}
