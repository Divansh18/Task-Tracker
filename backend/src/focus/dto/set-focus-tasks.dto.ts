import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsDateString,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class SetFocusTasksDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsArray()
  @ArrayMaxSize(3)
  @ArrayUnique()
  @IsUUID('4', { each: true })
  taskIds!: string[];
}


