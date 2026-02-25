import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from '../tasks/tasks-service';
import { TaskCommentsService } from './task-comments.service';
import { CreateCommentDto } from '../tasks/dto/create-comment.dto';
import { TaskComment } from '../tasks/entities/task-comment.entity';
export declare class TaskCommentsController {
    private readonly tasksService;
    private readonly commentsService;
    constructor(tasksService: TasksService, commentsService: TaskCommentsService);
    list(user: AuthUser, taskId: string): Promise<TaskComment[]>;
    create(user: AuthUser, taskId: string, dto: CreateCommentDto): Promise<TaskComment[]>;
}
