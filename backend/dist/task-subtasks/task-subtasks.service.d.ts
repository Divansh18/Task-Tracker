import { Repository } from 'typeorm';
import { TaskSubtask } from '../tasks/entities/task-subtask.entity';
import { Task } from '../tasks/entities/task.entity';
import { CreateSubtaskDto } from '../tasks/dto/create-subtask.dto';
import { UpdateSubtaskDto } from '../tasks/dto/update-subtask.dto';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskActivityService } from '../tasks/task-activity.service';
export declare class TaskSubtasksService {
    private readonly subtaskRepository;
    private readonly activityService;
    constructor(subtaskRepository: Repository<TaskSubtask>, activityService: TaskActivityService);
    list(task: Task): Promise<TaskSubtask[]>;
    create(task: Task, user: AuthUser, dto: CreateSubtaskDto): Promise<TaskSubtask[]>;
    update(task: Task, user: AuthUser, subtaskId: string, dto: UpdateSubtaskDto): Promise<TaskSubtask[]>;
    remove(task: Task, user: AuthUser, subtaskId: string): Promise<TaskSubtask[]>;
}
