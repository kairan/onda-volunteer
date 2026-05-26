import { Module } from '@nestjs/common';
import { StewardshipModule } from '../organization/stewardship.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

@Module({
  imports: [StewardshipModule],
  controllers: [EventsController],
  providers: [EventsService],
})
export class EventsModule {}
