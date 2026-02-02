import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
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
export declare class ProductivityService {
    private readonly tasksRepository;
    private readonly focusService;
    private readonly reflectionsService;
    constructor(tasksRepository: Repository<Task>, focusService: FocusService, reflectionsService: ReflectionsService);
    private startOfDay;
    private endOfDay;
    private formatDate;
    private calculateScore;
    private calculateStreak;
    getTodayDashboard(user: AuthUser): Promise<{
        date: string;
        summary: {
            totalTasks: number;
            completedToday: number;
            overdueCount: number;
            inProgress: number;
            focusAssigned: number;
        };
        focus: {
            tasks: {
                id: string;
                focusDate: string;
                position: number;
                task: Task;
            }[];
            remainingSlots: number;
        };
        streak: ProductivityStreak;
        score: ProductivityScore;
        sections: {
            dueToday: Task[];
            upcoming: Task[];
            overdue: Task[];
            inProgress: Task[];
            focusTaskIds: string[];
        };
        energyBreakdown: {
            energyLevel: TaskEnergyLevel;
            done: number;
            inProgress: number;
            todo: number;
        }[];
        reflection: import("../reflections/entities/daily-reflection.entity").DailyReflection;
    }>;
    getInsights(user: AuthUser): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
    }[]>;
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
    getPlanningSuggestions(user: AuthUser, payload: {
        availableMinutes: number;
        energyLevel?: TaskEnergyLevel;
    }): Promise<Task[]>;
}
export {};
