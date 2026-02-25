import { AuthUser } from '../auth/types/auth-user.type';
import { TasksService } from '../tasks/tasks-service';
import { TaskSubtasksService } from './task-subtasks.service';
import { CreateSubtaskDto } from '../tasks/dto/create-subtask.dto';
import { UpdateSubtaskDto } from '../tasks/dto/update-subtask.dto';
import { TaskSubtask } from '../tasks/entities/task-subtask.entity';
export declare class TaskSubtasksController {
    private readonly tasksService;
    private readonly subtasksService;
    constructor(tasksService: TasksService, subtasksService: TaskSubtasksService);
    list(user: AuthUser, taskId: string): Promise<TaskSubtask[]>;
    create(user: AuthUser, taskId: string, dto: CreateSubtaskDto): Promise<TaskSubtask[]>;
    update(user: AuthUser, taskId: string, subtaskId: string, dto: UpdateSubtaskDto): Promise<TaskSubtask[]>;
    remove(user: AuthUser, taskId: string, subtaskId: string): Promise<TaskSubtask[]>;
}
