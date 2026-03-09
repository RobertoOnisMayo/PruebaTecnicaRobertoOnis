import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { BalanceSchedulerService } from './balance-scheduler.service';
import { SyncController } from './sync.controller';
import { BalanceRecord } from './balance.entity';
import { ReeModule } from '../ree/ree.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BalanceRecord]),
    ReeModule,
  ],
  controllers: [BalanceController, SyncController],
  providers: [BalanceService, BalanceSchedulerService],
  exports: [BalanceService],
})
export class BalanceModule {}
