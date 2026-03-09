import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { BalanceService } from './balance.service';
import { SyncDto } from './dto/sync.dto';

@Controller('api/sync')
export class SyncController {
  private readonly logger = new Logger(SyncController.name);

  constructor(private readonly balanceService: BalanceService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async sync(@Body() body: SyncDto) {
    const end = body.end_date
      ? new Date(body.end_date)
      : new Date();
    const start = body.start_date
      ? new Date(body.start_date)
      : new Date(end);
    if (!body.start_date) {
      start.setDate(start.getDate() - 30);
    }
    const startStr = start.toISOString().slice(0, 19);
    const endStr = end.toISOString().slice(0, 19);

    this.logger.log(`Manual sync: ${startStr} to ${endStr}`);

    const { stored } = await this.balanceService.fetchAndStore(
      startStr,
      endStr,
      body.time_trunc || 'day',
    );

    return { success: true, stored };
  }
}
