import { AuthUser } from '../../auth/types/auth-user.type';
import { PlanningService } from './planning.service';
import { PlanningRequestDto } from './dto/planning-request.dto';
export declare class PlanningController {
    private readonly planningService;
    constructor(planningService: PlanningService);
    getRecommendations(user: AuthUser, dto: PlanningRequestDto): Promise<import("../../tasks/entities/task.entity").Task[]>;
}
