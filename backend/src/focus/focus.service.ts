import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { FocusTask } from './entities/focus-task.entity';
import { Task } from '../tasks/entities/task.entity';
import { SetFocusTasksDto } from './dto/set-focus-tasks.dto';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskActivityService } from '../tasks/task-activity.service';
import { TaskActivityType } from '../tasks/enums/task-activity-type.enum';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FocusService {
  constructor(
    @InjectRepository(FocusTask)
    private readonly focusRepository: Repository<FocusTask>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    private readonly activityService: TaskActivityService,
  ) {}

  private normalizeDate(date?: string): string {
    if (date) {
      return new Date(date).toISOString().slice(0, 10);
    }
    return new Date().toISOString().slice(0, 10);
  }

  async getFocusTasks(user: AuthUser, date?: string): Promise<FocusTask[]> {
    const focusDate = this.normalizeDate(date);
    return this.focusRepository.find({
      where: {
        user: { id: user.id },
        focusDate,
      },
      relations: { task: true },
      order: { position: 'ASC', createdAt: 'ASC' },
    });
  }

  async updateFocusTasks(user: AuthUser, payload: SetFocusTasksDto): Promise<FocusTask[]> {
    const focusDate = this.normalizeDate(payload.date);

    const previous = await this.focusRepository.find({
      where: { user: { id: user.id }, focusDate },
      relations: { task: true },
    });

    if (payload.taskIds.length > 3) {
      throw new BadRequestException('You can only select up to 3 focus tasks per day.');
    }

    if (!payload.taskIds.length) {
      for (const focus of previous) {
        await this.activityService.record(focus.task, user, TaskActivityType.FocusCleared, {
          focusDate,
        });
      }
      await this.focusRepository
        .createQueryBuilder()
        .delete()
        .where('userId = :userId AND focusDate = :focusDate', { userId: user.id, focusDate })
        .execute();
      return [];
    }

    const tasks = await this.taskRepository.find({
      where: {
        id: In(payload.taskIds),
        user: { id: user.id },
      },
    });

    if (tasks.length !== payload.taskIds.length) {
      throw new BadRequestException('One or more tasks are invalid.');
    }

    const eligibleTasks = tasks.filter((task) => task.status !== TaskStatus.Done);
    if (eligibleTasks.length !== tasks.length) {
      throw new BadRequestException('Completed tasks cannot be selected as focus tasks.');
    }

    const previousIds = new Set(previous.map((item) => item.task.id));
    const nextIds = new Set(payload.taskIds);

    const toRemove = previous.filter((focus) => !nextIds.has(focus.task.id));
    const toAdd = payload.taskIds.filter((taskId) => !previousIds.has(taskId));

    await this.focusRepository
      .createQueryBuilder()
      .delete()
      .where('userId = :userId AND focusDate = :focusDate', { userId: user.id, focusDate })
      .execute();

    const focusTasks = payload.taskIds.map((taskId, index) =>
      this.focusRepository.create({
        user: { id: user.id } as User,
        task: { id: taskId } as Task,
        focusDate,
        position: index,
      }),
    );

    await this.focusRepository.save(focusTasks);

    for (const focus of toRemove) {
      await this.activityService.record(focus.task, user, TaskActivityType.FocusCleared, {
        focusDate,
      });
    }

    for (const taskId of toAdd) {
      const task = tasks.find((item) => item.id === taskId)!;
      await this.activityService.record(task, user, TaskActivityType.FocusAssigned, {
        focusDate,
      });
    }

    return this.getFocusTasks(user, focusDate);
  }
}

