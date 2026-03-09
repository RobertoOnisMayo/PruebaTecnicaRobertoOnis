import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { BalanceService } from './balance.service';

@Injectable()
export class BalanceSchedulerService {
  private readonly logger = new Logger(BalanceSchedulerService.name);

  constructor(private readonly balanceService: BalanceService) {}

  @Cron('0 */6 * * *')
  async handleCron() {
    this.logger.log('Running scheduled REE data sync');
    try {
      const end = new Date();
      const start = new Date(end);
      start.setDate(start.getDate() - 7);

      const startStr = start.toISOString().slice(0, 19);
      const endStr = end.toISOString().slice(0, 19);

      const { stored } = await this.balanceService.fetchAndStore(
        startStr,
        endStr,
        'day',
      );
      this.logger.log(`Scheduled sync completed: ${stored} records stored`);
    } catch (error) {
      this.logger.error('Scheduled sync failed', error);
    }
  }
}
