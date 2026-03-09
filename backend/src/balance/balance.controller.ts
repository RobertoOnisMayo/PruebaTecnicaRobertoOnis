import {
  Controller,
  Get,
  Query,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { BalanceQueryDto } from './dto/balance-query.dto';

@Controller('api/balance')
export class BalanceController {
  private readonly logger = new Logger(BalanceController.name);

  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  async getBalance(@Query() query: BalanceQueryDto) {
    const { start_date, end_date } = query;
    const start = new Date(start_date);
    const end = new Date(end_date);

    if (start > end) {
      throw new BadRequestException('start_date must be before end_date');
    }

    const maxRangeDays = 365;
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > maxRangeDays) {
      throw new BadRequestException(
        `Date range cannot exceed ${maxRangeDays} days`,
      );
    }

    const records = await this.balanceService.findByDateRange(
      start_date,
      end_date,
    );

    const dates = await this.balanceService.getUniqueDates(start_date, end_date);

    return {
      data: records,
      meta: {
        start_date,
        end_date,
        records_count: records.length,
        unique_dates: dates.length,
      },
    };
  }
}
