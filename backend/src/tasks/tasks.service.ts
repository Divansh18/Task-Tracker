import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

  async create(user: AuthUser, dto: CreateTaskDto): Promise<Task> {
    const task = this.tasksRepository.create({
      ...dto,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
      user: { id: user.id } as User,
    });
    return this.tasksRepository.save(task);
  }

  async findAll(user: AuthUser, filters: FilterTasksDto): Promise<Task[]> {
    const where: FindOptionsWhere<Task> = { user: { id: user.id } as User };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.search) {
      const searchTerm = `%${filters.search}%`;
      return this.tasksRepository.find({
        where: [
          { ...where, title: Like(searchTerm) },
          { ...where, description: Like(searchTerm) },
        ],
        order: { createdAt: 'DESC' },
      });
    }

    return this.tasksRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(user: AuthUser, id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.user.id !== user.id) {
      throw new ForbiddenException('You are not allowed to access this task');
    }

    return task;
  }

  async update(user: AuthUser, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.findOne(user, id);

    if (dto.dueDate !== undefined) {
      task.dueDate = dto.dueDate ? new Date(dto.dueDate) : null;
    }

    Object.assign(task, {
      ...dto,
      dueDate: task.dueDate,
    });

    return this.tasksRepository.save(task);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const task = await this.findOne(user, id);
    await this.tasksRepository.remove(task);
  }
}
