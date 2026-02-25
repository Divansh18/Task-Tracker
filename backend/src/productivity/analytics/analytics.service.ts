import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../../tasks/entities/task.entity';
import { AuthUser } from '../../auth/types/auth-user.type';
import { TaskStatus } from '../../tasks/enums/task-status.enum';
import { TaskPriority } from '../../tasks/enums/task-priority.enum';
import { TaskEnergyLevel } from '../../tasks/enums/task-energy-level.enum';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
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
}





