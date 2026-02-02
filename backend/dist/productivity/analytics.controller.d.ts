import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';
export declare class AnalyticsController {
    private readonly productivityService;
    constructor(productivityService: ProductivityService);
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
            priority: import("../tasks/enums/task-priority.enum").TaskPriority;
            completed: number;
            open: number;
        }[];
        energyLevelBreakdown: {
            energyLevel: import("../tasks/enums/task-energy-level.enum").TaskEnergyLevel;
            count: number;
        }[];
    }>;
}
