import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AssignmentsController } from './assignments.controller';
import { SchedulingService } from './scheduling.service';

@Module({
  imports: [PrismaModule],
  controllers: [AssignmentsController],
  providers: [SchedulingService],
  exports: [SchedulingService],
})
export class SchedulingModule {}
