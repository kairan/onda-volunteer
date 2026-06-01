import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { OrganizationModule } from '../organization/organization.module';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminInviteModule } from './admin-invite.module';
import { SystemAdminAccreditationService } from './system-admin-accreditation.service';
import { SystemAdminAdminInvitesController } from './system-admin-admin-invites.controller';
import { SystemAdminChurchesController } from './system-admin-churches.controller';
import { SystemAdminChurchesService } from './system-admin-churches.service';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminOrganizationController } from './system-admin-organization.controller';
import { SystemAdminVolunteersController } from './system-admin-volunteers.controller';
import { SystemAdminVolunteersService } from './system-admin-volunteers.service';
import { SupabaseAdminService } from './supabase-admin.service';

@Module({
  imports: [IdentityModule, PrismaModule, AdminInviteModule, OrganizationModule],
  controllers: [
    SystemAdminController,
    SystemAdminChurchesController,
    SystemAdminAdminInvitesController,
    SystemAdminVolunteersController,
    SystemAdminOrganizationController,
  ],
  providers: [
    SystemAdminChurchesService,
    SystemAdminVolunteersService,
    SystemAdminAccreditationService,
  ],
})
export class SystemAdminModule {
  constructor(supabaseAdmin: SupabaseAdminService) {
    supabaseAdmin.logMissingServiceRoleIfNeeded();
  }
}
