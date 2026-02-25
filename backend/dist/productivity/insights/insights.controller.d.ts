import { AuthUser } from '../../auth/types/auth-user.type';
import { InsightsService } from './insights.service';
export declare class InsightsController {
    private readonly insightsService;
    constructor(insightsService: InsightsService);
    getInsights(user: AuthUser): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
    }[]>;
}
