import { IsDateString, IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TaskPriority } from '../enums/task-priority.enum';
import { TaskStatus } from '../enums/task-status.enum';
import { TaskEnergyLevel } from '../enums/task-energy-level.enum';

export class FilterTasksDto {
  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  search?: string;

  @IsEnum(TaskEnergyLevel)
  @IsOptional()
  energyLevel?: TaskEnergyLevel;

  @IsDateString()
  @IsOptional()
  dueBefore?: string;

  @IsDateString()
  @IsOptional()
  dueAfter?: string;
}
