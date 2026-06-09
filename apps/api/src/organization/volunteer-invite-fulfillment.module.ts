import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { VolunteerInviteFulfillmentService } from './volunteer-invite-fulfillment.service';

@Module({
  imports: [PrismaModule],
  providers: [VolunteerInviteFulfillmentService],
  exports: [VolunteerInviteFulfillmentService],
})
export class VolunteerInviteFulfillmentModule {}
