import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskEnergyLevel } from '../enums/task-energy-level.enum';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    dueDate?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    energyLevel?: TaskEnergyLevel;
    estimatedMinutes?: number;
}
