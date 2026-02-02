import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from './tasks.service';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityLog } from './entities/task-activity.entity';
export declare class TaskActivityController {
    private readonly tasksService;
    private readonly activityService;
    constructor(tasksService: TasksService, activityService: TaskActivityService);
    list(user: AuthUser, taskId: string): Promise<TaskActivityLog[]>;
}
