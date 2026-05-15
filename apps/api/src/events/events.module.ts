import { Module } from '@nestjs/common';
import { SchedulingModule } from '../scheduling/scheduling.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [SchedulingModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
