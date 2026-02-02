import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';
export declare class DashboardController {
    private readonly productivityService;
    constructor(productivityService: ProductivityService);
    getToday(user: AuthUser): Promise<{
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
                task: import("../tasks/entities/task.entity").Task;
            }[];
            remainingSlots: number;
        };
        streak: {
            current: number;
            longest: number;
            lastCompletedDate?: string;
        };
        score: {
            value: number;
            breakdown: {
                base: number;
                focus: number;
                overduePenalty: number;
            };
            completedToday: number;
            focusAssigned: number;
            focusCompleted: number;
            overdueCount: number;
        };
        sections: {
            dueToday: import("../tasks/entities/task.entity").Task[];
            upcoming: import("../tasks/entities/task.entity").Task[];
            overdue: import("../tasks/entities/task.entity").Task[];
            inProgress: import("../tasks/entities/task.entity").Task[];
            focusTaskIds: string[];
        };
        energyBreakdown: {
            energyLevel: import("../tasks/enums/task-energy-level.enum").TaskEnergyLevel;
            done: number;
            inProgress: number;
            todo: number;
        }[];
        reflection: import("../reflections/entities/daily-reflection.entity").DailyReflection;
    }>;
}
