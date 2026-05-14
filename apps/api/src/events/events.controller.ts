import { Controller, Get, Param } from '@nestjs/common';
import { EventsService } from './events.service';

@Controller('events')
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.events.getEventDetail(id);
  }
}
