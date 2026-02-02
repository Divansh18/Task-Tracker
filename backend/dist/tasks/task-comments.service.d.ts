import { Repository } from 'typeorm';
import { TaskComment } from './entities/task-comment.entity';
import { Task } from './entities/task.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskActivityService } from './task-activity.service';
export declare class TaskCommentsService {
    private readonly commentsRepository;
    private readonly activityService;
    constructor(commentsRepository: Repository<TaskComment>, activityService: TaskActivityService);
    list(task: Task): Promise<TaskComment[]>;
    create(task: Task, user: AuthUser, dto: CreateCommentDto): Promise<TaskComment[]>;
}
