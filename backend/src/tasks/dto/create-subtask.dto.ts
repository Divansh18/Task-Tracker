import { IsNotEmpty, IsOptional, IsString, MaxLength, Min, IsInt } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title!: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;
}


