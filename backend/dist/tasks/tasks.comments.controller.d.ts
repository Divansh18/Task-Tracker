import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from './tasks.service';
import { TaskCommentsService } from './task-comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TaskComment } from './entities/task-comment.entity';
export declare class TaskCommentsController {
    private readonly tasksService;
    private readonly commentsService;
    constructor(tasksService: TasksService, commentsService: TaskCommentsService);
    list(user: AuthUser, taskId: string): Promise<TaskComment[]>;
    create(user: AuthUser, taskId: string, dto: CreateCommentDto): Promise<TaskComment[]>;
}
