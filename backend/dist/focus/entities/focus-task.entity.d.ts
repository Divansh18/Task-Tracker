import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';
export declare class FocusTask {
    id: string;
    user: User;
    task: Task;
    focusDate: string;
    position: number;
    createdAt: Date;
}
