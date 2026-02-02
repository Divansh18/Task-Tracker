import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskSubtask } from './entities/task-subtask.entity';
import { Task } from './entities/task.entity';
import { CreateSubtaskDto } from './dto/create-subtask.dto';
import { UpdateSubtaskDto } from './dto/update-subtask.dto';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskActivityService } from './task-activity.service';
import { TaskActivityType } from './enums/task-activity-type.enum';

@Injectable()
export class TaskSubtasksService {
  constructor(
    @InjectRepository(TaskSubtask)
    private readonly subtaskRepository: Repository<TaskSubtask>,
    private readonly activityService: TaskActivityService,
  ) {}

  async list(task: Task): Promise<TaskSubtask[]> {
    return this.subtaskRepository.find({
      where: { task: { id: task.id } as Task },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(task: Task, user: AuthUser, dto: CreateSubtaskDto): Promise<TaskSubtask[]> {
    const highestPosition = await this.subtaskRepository
      .createQueryBuilder('subtask')
      .select('MAX(subtask.position)', 'max')
      .where('subtask.taskId = :taskId', { taskId: task.id })
      .getRawOne<{ max: number | null }>();

    const position =
      dto.position !== undefined ? dto.position : highestPosition?.max !== null ? highestPosition.max + 1 : 0;

    const subtask = this.subtaskRepository.create({
      title: dto.title,
      position,
      task: { id: task.id } as Task,
    });
    await this.subtaskRepository.save(subtask);

    await this.activityService.record(task, user, TaskActivityType.SubtaskAdded, {
      subtaskId: subtask.id,
      title: subtask.title,
    });

    return this.list(task);
  }

  async update(task: Task, user: AuthUser, subtaskId: string, dto: UpdateSubtaskDto): Promise<TaskSubtask[]> {
    const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId }, relations: { task: true } });
    if (!subtask || subtask.task.id !== task.id) {
      throw new NotFoundException('Subtask not found');
    }

    const updates: Partial<TaskSubtask> = {};
    if (dto.title !== undefined) {
      updates.title = dto.title;
    }
    if (dto.position !== undefined) {
      updates.position = dto.position;
    }
    let activityType: TaskActivityType | null = null;
    const metadata: Record<string, unknown> = { subtaskId: subtask.id };

    if (dto.isCompleted !== undefined) {
      updates.isCompleted = dto.isCompleted;
      updates.completedAt = dto.isCompleted ? new Date() : null;
      activityType = dto.isCompleted ? TaskActivityType.SubtaskCompleted : TaskActivityType.SubtaskReopened;
    } else {
      activityType = TaskActivityType.SubtaskUpdated;
    }

    Object.assign(subtask, updates);
    await this.subtaskRepository.save(subtask);

    await this.activityService.record(task, user, activityType, metadata);

    return this.list(task);
  }

  async remove(task: Task, user: AuthUser, subtaskId: string): Promise<TaskSubtask[]> {
    const subtask = await this.subtaskRepository.findOne({ where: { id: subtaskId }, relations: { task: true } });
    if (!subtask || subtask.task.id !== task.id) {
      throw new NotFoundException('Subtask not found');
    }

    await this.subtaskRepository.remove(subtask);

    await this.activityService.record(task, user, TaskActivityType.SubtaskUpdated, {
      subtaskId,
      action: 'deleted',
    });

    return this.list(task);
  }
}

