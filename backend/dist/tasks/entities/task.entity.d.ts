import { User } from '../../users/entities/user.entity';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskEnergyLevel } from '../enums/task-energy-level.enum';
import { TaskSubtask } from './task-subtask.entity';
import { TaskComment } from './task-comment.entity';
import { TaskActivityLog } from './task-activity.entity';
import { FocusTask } from '../../focus/entities/focus-task.entity';
export declare class Task {
    id: string;
    title: string;
    description?: string;
    dueDate?: Date | null;
    priority: TaskPriority;
    status: TaskStatus;
    energyLevel: TaskEnergyLevel;
    estimatedMinutes?: number | null;
    completedAt?: Date | null;
    user: User;
    subtasks: TaskSubtask[];
    comments: TaskComment[];
    activities: TaskActivityLog[];
    focusAssignments: FocusTask[];
    createdAt: Date;
    updatedAt: Date;
}
