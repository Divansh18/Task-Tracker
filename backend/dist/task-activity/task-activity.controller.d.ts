import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from '../tasks/tasks-service';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityLog } from '../tasks/entities/task-activity.entity';
export declare class TaskActivityController {
    private readonly tasksService;
    private readonly activityService;
    constructor(tasksService: TasksService, activityService: TaskActivityService);
    list(user: AuthUser, taskId: string): Promise<TaskActivityLog[]>;
}
