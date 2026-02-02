import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  LessThan,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { TaskPriority } from '../tasks/enums/task-priority.enum';
import { TaskEnergyLevel } from '../tasks/enums/task-energy-level.enum';
import { FocusService } from '../focus/focus.service';
import { ReflectionsService } from '../reflections/reflections.service';

type ScoreBreakdown = {
  base: number;
  focus: number;
  overduePenalty: number;
};

type ProductivityScore = {
  value: number;
  breakdown: ScoreBreakdown;
  completedToday: number;
  focusAssigned: number;
  focusCompleted: number;
  overdueCount: number;
};

type ProductivityStreak = {
  current: number;
  longest: number;
  lastCompletedDate?: string;
};

@Injectable()
export class ProductivityService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
    private readonly focusService: FocusService,
    private readonly reflectionsService: ReflectionsService,
  ) {}

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private endOfDay(date: Date): Date {
    const start = this.startOfDay(date);
    return new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 59, 999);
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private calculateScore(details: {
    completedToday: number;
    focusAssigned: number;
    focusCompleted: number;
    overdueCount: number;
  }): ProductivityScore {
    const completedContribution = Math.min(60, (details.completedToday / 5) * 60);
    const focusContribution = Math.min(30, details.focusCompleted * 10);
    const overduePenalty = Math.min(30, details.overdueCount * 10);
    const rawScore = Math.max(0, Math.min(100, Math.round(completedContribution + focusContribution - overduePenalty)));

    return {
      value: rawScore,
      breakdown: {
        base: Math.round(completedContribution),
        focus: Math.round(focusContribution),
        overduePenalty: Math.round(overduePenalty),
      },
      completedToday: details.completedToday,
      focusAssigned: details.focusAssigned,
      focusCompleted: details.focusCompleted,
      overdueCount: details.overdueCount,
    };
  }

  private async calculateStreak(userId: string, today: Date): Promise<ProductivityStreak> {
    const completions = await this.tasksRepository
      .createQueryBuilder('task')
      .select('DATE(task.completedAt)', 'date')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.userId = :userId', { userId })
      .andWhere('task.completedAt IS NOT NULL')
      .groupBy('DATE(task.completedAt)')
      .orderBy('DATE(task.completedAt)', 'DESC')
      .getRawMany<{ date: string; count: string }>();

    if (!completions.length) {
      return { current: 0, longest: 0 };
    }

    const dates = completions.map((item) => item.date);
    const dateSet = new Set(dates);

    let currentStreak = 0;
    let cursor = new Date(today);

    while (dateSet.has(this.formatDate(cursor))) {
      currentStreak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }

    let longestStreak = 0;
    let streakCounter = 0;
    let previousDate: Date | null = null;

    const chronological = [...dates].sort();
    for (const dateString of chronological) {
      const currentDate = new Date(dateString);
      if (
        previousDate &&
        this.formatDate(new Date(previousDate.getTime() + 24 * 60 * 60 * 1000)) === this.formatDate(currentDate)
      ) {
        streakCounter += 1;
      } else {
        streakCounter = 1;
      }
      longestStreak = Math.max(longestStreak, streakCounter);
      previousDate = currentDate;
    }

    const lastCompletedDate = dates[0];

    return {
      current: currentStreak,
      longest: longestStreak,
      lastCompletedDate,
    };
  }

  async getTodayDashboard(user: AuthUser) {
    const today = new Date();
    const todayStart = this.startOfDay(today);
    const todayEnd = this.endOfDay(today);
    const todayDate = this.formatDate(today);

    const [focusTasks, reflection] = await Promise.all([
      this.focusService.getFocusTasks(user, todayDate),
      this.reflectionsService.getReflection(user, todayDate),
    ]);

    const focusTaskIds = focusTasks.map((item) => item.task.id);

    const [
      totalTasks,
      completedToday,
      overdueCount,
      dueTodayTasks,
      upcomingTasks,
      overdueTasks,
      inProgressTasks,
    ] = await Promise.all([
      this.tasksRepository.count({ where: { user: { id: user.id } } }),
      this.tasksRepository.count({
        where: {
          user: { id: user.id },
          completedAt: Between(todayStart, todayEnd),
        },
      }),
      this.tasksRepository.count({
        where: {
          user: { id: user.id },
          status: Not(TaskStatus.Done),
          dueDate: LessThan(todayStart),
        },
      }),
      this.tasksRepository.find({
        where: {
          user: { id: user.id },
          status: Not(TaskStatus.Done),
          dueDate: Between(todayStart, todayEnd),
        },
        order: { dueDate: 'ASC' },
      }),
      this.tasksRepository.find({
        where: {
          user: { id: user.id },
          status: Not(TaskStatus.Done),
          dueDate: Between(this.startOfDay(new Date(today.getTime() + 24 * 60 * 60 * 1000)), this.endOfDay(
            new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
          )),
        },
        order: { dueDate: 'ASC' },
      }),
      this.tasksRepository.find({
        where: {
          user: { id: user.id },
          status: Not(TaskStatus.Done),
          dueDate: LessThan(todayStart),
        },
        order: { dueDate: 'ASC' },
      }),
      this.tasksRepository.find({
        where: {
          user: { id: user.id },
          status: TaskStatus.InProgress,
        },
        order: { updatedAt: 'DESC' },
        take: 5,
      }),
    ]);

    const focusCompleted = focusTasks.filter((focus) => focus.task.status === TaskStatus.Done).length;
    const score = this.calculateScore({
      completedToday,
      focusAssigned: focusTasks.length,
      focusCompleted,
      overdueCount,
    });

    const streak = await this.calculateStreak(user.id, today);

    const energyBreakdown = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.energyLevel', 'energyLevel')
      .addSelect('SUM(CASE WHEN task.status = :done THEN 1 ELSE 0 END)', 'doneCount')
      .addSelect('SUM(CASE WHEN task.status = :inProgress THEN 1 ELSE 0 END)', 'inProgressCount')
      .addSelect('SUM(CASE WHEN task.status = :todo THEN 1 ELSE 0 END)', 'todoCount')
      .where('task.userId = :userId', { userId: user.id })
      .setParameters({
        done: TaskStatus.Done,
        inProgress: TaskStatus.InProgress,
        todo: TaskStatus.Todo,
      })
      .groupBy('task.energyLevel')
      .getRawMany<{
        energyLevel: TaskEnergyLevel;
        doneCount: string;
        inProgressCount: string;
        todoCount: string;
      }>();

    const focusTasksDetailed = focusTasks.map((focus, index) => ({
      id: focus.id,
      focusDate: focus.focusDate,
      position: index,
      task: focus.task,
    }));

    return {
      date: todayDate,
      summary: {
        totalTasks,
        completedToday,
        overdueCount,
        inProgress: inProgressTasks.length,
        focusAssigned: focusTasks.length,
      },
      focus: {
        tasks: focusTasksDetailed,
        remainingSlots: Math.max(0, 3 - focusTasks.length),
      },
      streak,
      score,
      sections: {
        dueToday: dueTodayTasks,
        upcoming: upcomingTasks,
        overdue: overdueTasks,
        inProgress: inProgressTasks,
        focusTaskIds,
      },
      energyBreakdown: energyBreakdown.map((row) => ({
        energyLevel: row.energyLevel,
        done: Number(row.doneCount),
        inProgress: Number(row.inProgressCount),
        todo: Number(row.todoCount),
      })),
      reflection,
    };
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

  async getAnalytics(user: AuthUser) {
    const today = new Date();
    const start = this.startOfDay(new Date(today.getTime() - 13 * 24 * 60 * 60 * 1000));

    const completionTrendRaw = await this.tasksRepository
      .createQueryBuilder('task')
      .select('DATE(task.completedAt)', 'date')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.userId = :userId', { userId: user.id })
      .andWhere('task.completedAt BETWEEN :start AND :end', {
        start,
        end: this.endOfDay(today),
      })
      .groupBy('DATE(task.completedAt)')
      .orderBy('DATE(task.completedAt)', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const overdueTrendRaw = await this.tasksRepository
      .createQueryBuilder('task')
      .select('DATE(task.dueDate)', 'date')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.userId = :userId', { userId: user.id })
      .andWhere('task.status != :done', { done: TaskStatus.Done })
      .andWhere('task.dueDate BETWEEN :start AND :end', {
        start,
        end: this.endOfDay(today),
      })
      .groupBy('DATE(task.dueDate)')
      .orderBy('DATE(task.dueDate)', 'ASC')
      .getRawMany<{ date: string; count: string }>();

    const priorityBreakdown = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.priority', 'priority')
      .addSelect('SUM(CASE WHEN task.status = :done THEN 1 ELSE 0 END)', 'completed')
      .addSelect('SUM(CASE WHEN task.status != :done THEN 1 ELSE 0 END)', 'open')
      .where('task.userId = :userId', { userId: user.id })
      .groupBy('task.priority')
      .setParameters({ done: TaskStatus.Done })
      .getRawMany<{ priority: TaskPriority; completed: string; open: string }>();

    const energyLevelBreakdown = await this.tasksRepository
      .createQueryBuilder('task')
      .select('task.energyLevel', 'energyLevel')
      .addSelect('COUNT(task.id)', 'count')
      .where('task.userId = :userId', { userId: user.id })
      .groupBy('task.energyLevel')
      .getRawMany<{ energyLevel: TaskEnergyLevel; count: string }>();

    const completionTrend: Array<{ date: string; count: number }> = [];
    for (let offset = 0; offset < 14; offset += 1) {
      const date = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
      const dateKey = this.formatDate(date);
      const match = completionTrendRaw.find((item) => item.date === dateKey);
      completionTrend.push({ date: dateKey, count: match ? Number(match.count) : 0 });
    }

    const overdueTrend: Array<{ date: string; count: number }> = [];
    for (let offset = 0; offset < 14; offset += 1) {
      const date = new Date(start.getTime() + offset * 24 * 60 * 60 * 1000);
      const dateKey = this.formatDate(date);
      const match = overdueTrendRaw.find((item) => item.date === dateKey);
      overdueTrend.push({ date: dateKey, count: match ? Number(match.count) : 0 });
    }

    return {
      completionTrend,
      overdueTrend,
      priorityBreakdown: priorityBreakdown.map((row) => ({
        priority: row.priority,
        completed: Number(row.completed),
        open: Number(row.open),
      })),
      energyLevelBreakdown: energyLevelBreakdown.map((row) => ({
        energyLevel: row.energyLevel,
        count: Number(row.count),
      })),
    };
  }

  async getPlanningSuggestions(user: AuthUser, payload: { availableMinutes: number; energyLevel?: TaskEnergyLevel }) {
    const tasks = await this.tasksRepository.find({
      where: {
        user: { id: user.id },
        status: Not(TaskStatus.Done),
      },
      order: { priority: 'DESC', createdAt: 'ASC' },
    });

    const filtered = payload.energyLevel
      ? tasks.filter((task) => task.energyLevel === payload.energyLevel)
      : tasks;

    const suggestions: Task[] = [];
    let remaining = payload.availableMinutes;

    for (const task of filtered.sort((a, b) => {
      const estimateA = a.estimatedMinutes ?? 30;
      const estimateB = b.estimatedMinutes ?? 30;
      if (estimateA === estimateB) {
        return a.priority === b.priority ? 0 : a.priority > b.priority ? -1 : 1;
      }
      return estimateA - estimateB;
    })) {
      const estimate = task.estimatedMinutes ?? 30;
      if (estimate <= remaining) {
        suggestions.push(task);
        remaining -= estimate;
      }
      if (suggestions.length >= 5) {
        break;
      }
    }

    if (!suggestions.length) {
      return tasks.slice(0, 3);
    }

    return suggestions;
  }
}

