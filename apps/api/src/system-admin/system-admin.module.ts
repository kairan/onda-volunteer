import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { OrganizationModule } from '../organization/organization.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemAdminAccreditationService } from './system-admin-accreditation.service';
import { SystemAdminChurchesController } from './system-admin-churches.controller';
import { SystemAdminChurchesService } from './system-admin-churches.service';
import { SystemAdminOrganizationController } from './system-admin-organization.controller';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminVolunteersController } from './system-admin-volunteers.controller';
import { SystemAdminVolunteersService } from './system-admin-volunteers.service';

@Module({
  imports: [IdentityModule, PrismaModule, OrganizationModule],
  controllers: [
    SystemAdminController,
    SystemAdminVolunteersController,
    SystemAdminOrganizationController,
    SystemAdminChurchesController,
  ],
  providers: [
    SystemAdminVolunteersService,
    SystemAdminAccreditationService,
    SystemAdminChurchesService,
  ],
})
export class SystemAdminModule {}
