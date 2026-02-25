import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { TaskEnergyLevel } from '../tasks/enums/task-energy-level.enum';
import { FocusService } from '../focus/focus.service';

@Injectable()
export class InsightsService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly focusService: FocusService,
  ) {}

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  async getInsights(user: AuthUser) {
    const today = new Date();
    const startWindow = this.startOfDay(new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000));

    const tasks = await this.tasksRepository.find({
      where: {
        user: { id: user.id },
        createdAt: MoreThanOrEqual(startWindow),
      },
      order: { createdAt: 'DESC' },
    });

    const insights: Array<{ id: string; title: string; description: string; category: string }> = [];

    const overdueRate =
      tasks.length > 0
        ? tasks.filter((task) => task.dueDate && task.status !== TaskStatus.Done && task.dueDate < new Date()).length /
          tasks.length
        : 0;

    if (overdueRate > 0.3) {
      insights.push({
        id: 'overdue-trend',
        title: 'Tasks are frequently overdue',
        description:
          'More than 30% of your tasks are slipping past their due dates. Consider scheduling smaller daily checkpoints or reducing your daily task load.',
        category: 'overdue',
      });
    }

    const focusAssignments = await this.focusService.getFocusTasks(user);
    const focusCompleted = focusAssignments.filter((focus) => focus.task.status === TaskStatus.Done).length;
    if (focusAssignments.length >= 2 && focusCompleted / focusAssignments.length < 0.5) {
      insights.push({
        id: 'focus-follow-through',
        title: 'Focus tasks need attention',
        description:
          'Less than half of your focus tasks are being completed. Try selecting fewer focus tasks or breaking them into smaller subtasks.',
        category: 'focus',
      });
    }

    const highEnergyTasks = tasks.filter((task) => task.energyLevel === TaskEnergyLevel.High);
    if (highEnergyTasks.length && highEnergyTasks.filter((task) => task.status !== TaskStatus.Done).length > 0) {
      insights.push({
        id: 'energy-distribution',
        title: 'High-energy work piling up',
        description:
          'You have pending high-energy tasks. Consider tackling one earlier in the day when energy is highest, or reassigning if possible.',
        category: 'energy',
      });
    }

    if (!insights.length) {
      insights.push({
        id: 'steady-progress',
        title: 'Progress on track',
        description: 'Your current workflow is balanced. Keep building on what is working well for you.',
        category: 'positive',
      });
    }

    return insights;
  }
}
