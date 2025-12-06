import { User } from '../../users/entities/user.entity';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
export declare class Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    user: User;
    createdAt: Date;
    updatedAt: Date;
}
