import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskEnergyLevel } from '../enums/task-energy-level.enum';
export declare class FilterTasksDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
    energyLevel?: TaskEnergyLevel;
    dueBefore?: string;
    dueAfter?: string;
}
