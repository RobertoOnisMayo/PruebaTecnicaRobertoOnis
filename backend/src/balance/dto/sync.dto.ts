import { IsDateString, IsOptional, IsIn } from 'class-validator';

export class SyncDto {
  @IsOptional()
  @IsDateString()
  start_date?: string;

  @IsOptional()
  @IsDateString()
  end_date?: string;

  @IsOptional()
  @IsIn(['day', 'hour', 'month'])
  time_trunc?: string;
}
