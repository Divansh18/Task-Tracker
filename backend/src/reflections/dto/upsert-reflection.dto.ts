import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertReflectionDto {
  @IsDateString()
  @IsOptional()
  date?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1200)
  wentWell?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1200)
  blockers?: string;

  @IsString()
  @IsOptional()
  @MaxLength(600)
  winOfDay?: string;
}


