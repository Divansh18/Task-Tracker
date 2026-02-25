import { Repository } from 'typeorm';
import { Task } from '../tasks/entities/task.entity';
import { AuthUser } from '../auth/types/auth-user.type';
import { TaskEnergyLevel } from '../tasks/enums/task-energy-level.enum';
export declare class PlanningService {
    private readonly tasksRepository;
    constructor(tasksRepository: Repository<Task>);
    getPlanningSuggestions(user: AuthUser, payload: {
        availableMinutes: number;
        energyLevel?: TaskEnergyLevel;
    }): Promise<Task[]>;
}
