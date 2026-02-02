import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { FilterTasksDto } from './dto/filter-tasks.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskPriority } from './enums/task-priority.enum';
import { TaskStatus } from './enums/task-status.enum';
import { TaskEnergyLevel } from './enums/task-energy-level.enum';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from './enums/task-activity-type.enum';
import { TaskSubtasksService } from './task-subtasks.service';
import { TaskCommentsService } from './task-comments.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly activityService: TaskActivityService,
    private readonly subtasksService: TaskSubtasksService,
    private readonly commentsService: TaskCommentsService,
  ) {}

  private normalizeDate(date?: string | null): Date | null {
    if (!date) {
      return null;
    }
    return new Date(date);
  }

  async create(user: AuthUser, dto: CreateTaskDto): Promise<Task> {
    const status = dto.status ?? TaskStatus.Todo;
    const task = this.tasksRepository.create({
      title: dto.title,
      description: dto.description?.trim() || null,
      dueDate: this.normalizeDate(dto.dueDate),
      priority: dto.priority ?? TaskPriority.Medium,
      status,
      energyLevel: dto.energyLevel ?? TaskEnergyLevel.Medium,
      estimatedMinutes: dto.estimatedMinutes ?? null,
      completedAt: status === TaskStatus.Done ? new Date() : null,
      user: { id: user.id } as User,
    });

    const saved = await this.tasksRepository.save(task);
    await this.activityService.record(saved, user, TaskActivityType.TaskCreated, {
      status: saved.status,
      priority: saved.priority,
    });

    return this.findOne(user, saved.id);
  }

  async findAll(user: AuthUser, filters: FilterTasksDto): Promise<Task[]> {
    const qb = this.tasksRepository
      .createQueryBuilder('task')
      .where('task.userId = :userId', { userId: user.id })
      .orderBy('task.createdAt', 'DESC');

    if (filters.status) {
      qb.andWhere('task.status = :status', { status: filters.status });
    }

    if (filters.priority) {
      qb.andWhere('task.priority = :priority', { priority: filters.priority });
    }

    if (filters.energyLevel) {
      qb.andWhere('task.energyLevel = :energyLevel', { energyLevel: filters.energyLevel });
    }

    if (filters.dueBefore) {
      qb.andWhere('task.dueDate IS NOT NULL AND task.dueDate <= :dueBefore', {
        dueBefore: new Date(filters.dueBefore),
      });
    }

    if (filters.dueAfter) {
      qb.andWhere('task.dueDate IS NOT NULL AND task.dueDate >= :dueAfter', {
        dueAfter: new Date(filters.dueAfter),
      });
    }

    if (filters.search) {
      qb.andWhere(
        new Brackets((where) => {
          where
            .where('LOWER(task.title) LIKE :search', { search: `%${filters.search.toLowerCase()}%` })
            .orWhere('LOWER(task.description) LIKE :search', { search: `%${filters.search.toLowerCase()}%` });
        }),
      );
    }

    return qb.getMany();
  }

  async findOne(user: AuthUser, id: string): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: {
        user: true,
        focusAssignments: true,
      },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.user.id !== user.id) {
      throw new ForbiddenException('You are not allowed to access this task');
    }

    const [subtasks, comments, activities] = await Promise.all([
      this.subtasksService.list(task),
      this.commentsService.list(task),
      this.activityService.listForTask(task),
    ]);

    task.subtasks = subtasks;
    task.comments = comments;
    task.activities = activities;

    return task;
  }

  async update(user: AuthUser, id: string, dto: UpdateTaskDto): Promise<Task> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { user: true },
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }

    if (task.user.id !== user.id) {
      throw new ForbiddenException('You are not allowed to modify this task');
    }

    const changes: Array<{ type: TaskActivityType; metadata?: Record<string, unknown> }> = [];

    if (dto.title !== undefined && dto.title !== task.title) {
      changes.push({
        type: TaskActivityType.TaskUpdated,
        metadata: { field: 'title', previous: task.title, next: dto.title },
      });
      task.title = dto.title;
    }

    if (dto.description !== undefined && dto.description !== task.description) {
      changes.push({
        type: TaskActivityType.TaskUpdated,
        metadata: {
          field: 'description',
          previous: task.description,
          hasNext: Boolean(dto.description),
        },
      });
      task.description = dto.description?.trim() || null;
    }

    if (dto.priority !== undefined && dto.priority !== task.priority) {
      changes.push({
        type: TaskActivityType.PriorityChanged,
        metadata: { previous: task.priority, next: dto.priority },
      });
      task.priority = dto.priority;
    }

    if (dto.energyLevel !== undefined && dto.energyLevel !== task.energyLevel) {
      changes.push({
        type: TaskActivityType.EnergyLevelUpdated,
        metadata: { previous: task.energyLevel, next: dto.energyLevel },
      });
      task.energyLevel = dto.energyLevel;
    }

    if (dto.estimatedMinutes !== undefined && dto.estimatedMinutes !== task.estimatedMinutes) {
      changes.push({
        type: TaskActivityType.EstimateUpdated,
        metadata: { previous: task.estimatedMinutes, next: dto.estimatedMinutes },
      });
      task.estimatedMinutes = dto.estimatedMinutes ?? null;
    }

    if (dto.dueDate !== undefined) {
      const nextDueDate = this.normalizeDate(dto.dueDate);
      const previous = task.dueDate ? task.dueDate.toISOString() : null;
      const next = nextDueDate ? nextDueDate.toISOString() : null;
      if (previous !== next) {
        changes.push({
          type: TaskActivityType.DueDateChanged,
          metadata: { previous: task.dueDate, next: nextDueDate },
        });
        task.dueDate = nextDueDate;
      }
    }

    if (dto.status !== undefined && dto.status !== task.status) {
      const previousStatus = task.status;
      task.status = dto.status;
      if (dto.status === TaskStatus.Done) {
        task.completedAt = new Date();
      } else if (previousStatus === TaskStatus.Done) {
        task.completedAt = null;
      }
      changes.push({
        type: TaskActivityType.StatusChanged,
        metadata: { previous: previousStatus, next: dto.status },
      });
    }

    await this.tasksRepository.save(task);

    for (const change of changes) {
      await this.activityService.record(task, user, change.type, change.metadata);
    }

    if (!changes.length) {
      await this.activityService.record(task, user, TaskActivityType.TaskUpdated);
    }

    return this.findOne(user, task.id);
  }

  async remove(user: AuthUser, id: string): Promise<void> {
    const task = await this.tasksRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!task) {
      throw new NotFoundException('Task not found');
    }
    if (task.user.id !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this task');
    }

    await this.activityService.record(task, user, TaskActivityType.TaskUpdated, {
      action: 'deleted',
    });
    await this.tasksRepository.remove(task);
  }
}
