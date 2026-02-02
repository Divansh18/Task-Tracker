import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TaskEnergyLevel } from '../../tasks/enums/task-energy-level.enum';

export class PlanningRequestDto {
  @IsInt()
  @Min(15)
  @Max(600)
  availableMinutes!: number;

  @IsEnum(TaskEnergyLevel)
  @IsOptional()
  energyLevel?: TaskEnergyLevel;
}


