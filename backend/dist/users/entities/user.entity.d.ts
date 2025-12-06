import { Task } from '../../tasks/entities/task.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    displayName?: string;
    tasks: Task[];
    createdAt: Date;
    updatedAt: Date;
}
