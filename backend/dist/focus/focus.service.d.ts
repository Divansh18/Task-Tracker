import { Repository } from 'typeorm';
import { FocusTask } from './entities/focus-task.entity';
import { Task } from '../tasks/entities/task.entity';
import { SetFocusTasksDto } from './dto/set-focus-tasks.dto';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskActivityService } from '../tasks/task-activity.service';
export declare class FocusService {
    private readonly focusRepository;
    private readonly taskRepository;
    private readonly activityService;
    constructor(focusRepository: Repository<FocusTask>, taskRepository: Repository<Task>, activityService: TaskActivityService);
    private normalizeDate;
    getFocusTasks(user: AuthUser, date?: string): Promise<FocusTask[]>;
    updateFocusTasks(user: AuthUser, payload: SetFocusTasksDto): Promise<FocusTask[]>;
}
