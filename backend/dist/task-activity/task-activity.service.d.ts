import { Repository } from 'typeorm';
import { TaskActivityLog } from '../tasks/entities/task-activity.entity';
import { TaskActivityType } from '../tasks/enums/task-activity-type.enum';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
export declare class TaskActivityService {
    private readonly activityRepository;
    constructor(activityRepository: Repository<TaskActivityLog>);
    record(task: Task, actor: AuthUser | null, type: TaskActivityType, metadata?: Record<string, unknown>): Promise<TaskActivityLog>;
    listForTask(task: Task): Promise<TaskActivityLog[]>;
}
