import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TaskActivityLog } from './entities/task-activity.entity';
import { TaskActivityType } from './enums/task-activity-type.enum';
import { Task } from './entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TaskActivityService {
  constructor(
    @InjectRepository(TaskActivityLog)
    private readonly activityRepository: Repository<TaskActivityLog>,
  ) {}

  async record(
    task: Task,
    actor: AuthUser | null,
    type: TaskActivityType,
    metadata?: Record<string, unknown>,
  ): Promise<TaskActivityLog> {
    const activity = this.activityRepository.create({
      task: { id: task.id } as Task,
      actor: actor ? ({ id: actor.id } as User) : null,
      type,
      metadata,
    });
    return this.activityRepository.save(activity);
  }

  async listForTask(task: Task): Promise<TaskActivityLog[]> {
    return this.activityRepository.find({
      where: { task: { id: task.id } as Task },
      relations: { actor: true },
      order: { createdAt: 'DESC' },
    });
  }
}


