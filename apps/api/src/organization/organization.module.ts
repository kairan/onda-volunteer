import { Module } from '@nestjs/common';
import { AdminInviteModule } from '../system-admin/admin-invite.module';
import { IdentityModule } from '../identity/identity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { CampusesController } from './campuses.controller';
import { ChurchesController } from './churches.controller';
import { ChurchMinistriesController } from './church-ministries.controller';
import { OrganizationContextController } from './organization-context.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { StewardshipModule } from './stewardship.module';
import { VolunteerInviteController } from './volunteer-invite.controller';
import { VolunteerInviteService } from './volunteer-invite.service';

@Module({
  imports: [PrismaModule, IdentityModule, StewardshipModule, AdminInviteModule],
  controllers: [
    CampusesController,
    ChurchesController,
    ChurchMinistriesController,
    OrganizationController,
    OrganizationContextController,
    RolesController,
    VolunteerInviteController,
  ],
  providers: [OrganizationService, RolesService, VolunteerInviteService],
  exports: [OrganizationService, VolunteerInviteService],
})
export class OrganizationModule {}
