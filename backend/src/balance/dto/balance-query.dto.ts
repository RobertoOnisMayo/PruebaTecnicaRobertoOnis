import { IsDateString, IsOptional, IsIn } from 'class-validator';

export class BalanceQueryDto {
  @IsDateString()
  start_date: string;

  @IsDateString()
  end_date: string;

  @IsOptional()
  @IsIn(['day', 'hour', 'month'])
  time_trunc?: string;
}
