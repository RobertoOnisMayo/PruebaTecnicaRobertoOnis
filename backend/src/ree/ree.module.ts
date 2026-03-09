import { Module } from '@nestjs/common';
import { ReeService } from './ree.service';

@Module({
  providers: [ReeService],
  exports: [ReeService],
})
export class ReeModule {}
