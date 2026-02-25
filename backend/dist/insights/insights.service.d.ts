import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { FocusService } from '../focus/focus.service';
export declare class InsightsService {
    private readonly tasksRepository;
    private readonly focusService;
    constructor(tasksRepository: Repository<Task>, focusService: FocusService);
    private startOfDay;
    getInsights(user: AuthUser): Promise<{
        id: string;
        title: string;
        description: string;
        category: string;
    }[]>;
}
