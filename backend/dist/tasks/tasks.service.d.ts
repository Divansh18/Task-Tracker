import { Repository } from 'typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
export declare class TasksService {
    private readonly tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    create(user: AuthUser, dto: CreateTaskDto): Promise<Task>;
    findAll(user: AuthUser, filters: FilterTasksDto): Promise<Task[]>;
    findOne(user: AuthUser, id: string): Promise<Task>;
    update(user: AuthUser, id: string, dto: UpdateTaskDto): Promise<Task>;
    remove(user: AuthUser, id: string): Promise<void>;
}
