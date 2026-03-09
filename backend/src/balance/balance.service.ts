import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceRecord } from './balance.entity';
import {
  ReeService,
  FlattenedBalanceRecord,
} from '../ree/ree.service';

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @InjectRepository(BalanceRecord)
    private readonly balanceRepo: Repository<BalanceRecord>,
    private readonly reeService: ReeService,
  ) {}

  async fetchAndStore(
    startDate: string,
    endDate: string,
    timeTrunc: string = 'day',
  ): Promise<{ stored: number }> {
    const records = await this.reeService.fetchBalanceData(
      startDate,
      endDate,
      timeTrunc,
    );
    return this.storeRecords(records);
  }

  private async storeRecords(
    records: FlattenedBalanceRecord[],
  ): Promise<{ stored: number }> {
    let stored = 0;
    for (const r of records) {
      await this.balanceRepo.upsert(
        {
          datetime: r.datetime,
          category: r.category,
          type: r.type,
          value: r.value,
          percentage: r.percentage,
          color: r.color,
        },
        {
          conflictPaths: ['datetime', 'category', 'type'],
        },
      );
      stored++;
    }
    this.logger.log(`Stored ${stored} balance records`);
    return { stored };
  }

  async findByDateRange(
    startDate: string,
    endDate: string,
  ): Promise<BalanceRecord[]> {
    const qb = this.balanceRepo
      .createQueryBuilder('b')
      .where('b.datetime >= :startDate', { startDate })
      .andWhere('b.datetime <= :endDate', { endDate })
      .orderBy('b.datetime', 'ASC')
      .addOrderBy('b.category')
      .addOrderBy('b.type');

    return qb.getMany();
  }

  async getUniqueDates(startDate: string, endDate: string): Promise<string[]> {
    const result = await this.balanceRepo
      .createQueryBuilder('b')
      .select("DISTINCT to_char(b.datetime, 'YYYY-MM-DD')", 'date')
      .where('b.datetime >= :startDate', { startDate })
      .andWhere('b.datetime <= :endDate', { endDate })
      .orderBy('date')
      .getRawMany();

    return result.map((r) => r.date);
  }
}
