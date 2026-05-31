import { Module } from '@nestjs/common';
import { ClockModule } from './common/clock.module';
import { IdentityModule } from './identity/identity.module';
import { PrismaModule } from './prisma/prisma.module';
import { EventsModule } from './events/events.module';
import { OrganizationModule } from './organization/organization.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SystemAdminModule } from './system-admin/system-admin.module';

@Module({
  imports: [
    ClockModule,
    IdentityModule,
    PrismaModule,
    EventsModule,
    OrganizationModule,
    SchedulingModule,
    SystemAdminModule,
  ],
})
export class AppModule {}
