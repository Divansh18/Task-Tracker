import { Task } from './task.entity';
export declare class TaskSubtask {
    id: string;
    title: string;
    isCompleted: boolean;
    completedAt?: Date | null;
    position: number;
    task: Task;
    createdAt: Date;
    updatedAt: Date;
}
