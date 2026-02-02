import { TaskEnergyLevel } from '../../tasks/enums/task-energy-level.enum';
export declare class PlanningRequestDto {
    availableMinutes: number;
    energyLevel?: TaskEnergyLevel;
}
