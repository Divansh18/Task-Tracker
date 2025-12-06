import { AuthUser } from '../auth/types/auth-user.type';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { TasksService } from './tasks.service';
export declare class TasksController {
    private readonly tasksService;
    constructor(tasksService: TasksService);
    create(user: AuthUser, createTaskDto: CreateTaskDto): Promise<Task>;
    findAll(user: AuthUser, filterDto: FilterTasksDto): Promise<Task[]>;
    findOne(user: AuthUser, id: string): Promise<Task>;
    update(user: AuthUser, id: string, updateTaskDto: UpdateTaskDto): Promise<Task>;
    remove(user: AuthUser, id: string): Promise<{
        success: true;
    }>;
}
