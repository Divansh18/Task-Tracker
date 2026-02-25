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
export class DashboardService {
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

    const dates = completions.map((c) => c.date).sort();
    let current = 0;
    let longest = 0;
    let temp = 0;
    const todayStr = this.formatDate(today);

    for (let i = dates.length - 1; i >= 0; i--) {
      const date = dates[i];
      if (date === todayStr || date === this.formatDate(new Date(today.getTime() - (dates.length - 1 - i) * 24 * 60 * 60 * 1000))) {
        temp++;
      } else {
        longest = Math.max(longest, temp);
        temp = 1;
      }
    }
    longest = Math.max(longest, temp);

    // Calculate current streak
    const lastCompletion = dates[dates.length - 1];
    if (lastCompletion === todayStr) {
      current = temp;
    } else {
      const daysDiff = Math.floor((today.getTime() - new Date(lastCompletion).getTime()) / (24 * 60 * 60 * 1000));
      if (daysDiff <= 1) {
        current = temp;
      }
    }

    return { current, longest, lastCompletedDate: dates[dates.length - 1] };
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
}
