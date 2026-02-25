import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskStatus } from '../tasks/enums/task-status.enum';
import { TaskEnergyLevel } from '../tasks/enums/task-energy-level.enum';

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(Task)
    private readonly tasksRepository: Repository<Task>,
  ) {}

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
