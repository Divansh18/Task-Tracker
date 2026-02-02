import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';
export declare class InsightsController {
    private readonly productivityService;
    constructor(productivityService: ProductivityService);
    getInsights(user: AuthUser): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
    }[]>;
}
