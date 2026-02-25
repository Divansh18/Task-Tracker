import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskPriority } from '../tasks/enums/task-priority.enum';
import { TaskEnergyLevel } from '../tasks/enums/task-energy-level.enum';
export declare class AnalyticsService {
    private readonly tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    private startOfDay;
    private endOfDay;
    private formatDate;
    getAnalytics(user: AuthUser): Promise<{
        completionTrend: {
            date: string;
            count: number;
        }[];
        overdueTrend: {
            date: string;
            count: number;
        }[];
        priorityBreakdown: {
            priority: TaskPriority;
            completed: number;
            open: number;
        }[];
        energyLevelBreakdown: {
            energyLevel: TaskEnergyLevel;
            count: number;
        }[];
    }>;
}
