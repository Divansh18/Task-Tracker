import { Task } from '../../tasks/entities/task.entity';
import { TaskComment } from '../../tasks/entities/task-comment.entity';
import { TaskActivityLog } from '../../tasks/entities/task-activity.entity';
import { FocusTask } from '../../focus/entities/focus-task.entity';
import { DailyReflection } from '../../reflections/entities/daily-reflection.entity';
export declare class User {
    id: string;
    email: string;
    passwordHash: string;
    displayName?: string;
    tasks: Task[];
    taskComments: TaskComment[];
    taskActivities: TaskActivityLog[];
    focusTasks: FocusTask[];
    reflections: DailyReflection[];
    createdAt: Date;
    updatedAt: Date;
}
