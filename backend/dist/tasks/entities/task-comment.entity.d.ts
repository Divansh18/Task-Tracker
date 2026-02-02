import { Task } from './task.entity';
import { User } from '../../users/entities/user.entity';
export declare class TaskComment {
    id: string;
    task: Task;
    author: User;
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
