import { AuthUser } from '../auth/types/auth-user.type';
import { ProductivityService } from './productivity.service';
import { PlanningRequestDto } from './dto/planning-request.dto';
export declare class PlanningController {
    private readonly productivityService;
    constructor(productivityService: ProductivityService);
    getRecommendations(user: AuthUser, dto: PlanningRequestDto): Promise<import("../tasks/entities/task.entity").Task[]>;
}
