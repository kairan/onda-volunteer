import { Module } from '@nestjs/common';
import { ClockModule } from './common/clock.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { OrganizationModule } from './organization/organization.module';
import { SchedulingModule } from './scheduling/scheduling.module';

@Module({
  imports: [
    ClockModule,
    PrismaModule,
    EventsModule,
    OrganizationModule,
    SchedulingModule,
  ],
})
export class AppModule {}
