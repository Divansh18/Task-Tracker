import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
export declare class FilterTasksDto {
    status?: TaskStatus;
    priority?: TaskPriority;
    search?: string;
}
