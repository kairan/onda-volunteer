import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { OrganizationModule } from '../organization/organization.module';
import { AdminInviteModule } from './admin-invite.module';
import { SystemAdminAdminInvitesController } from './system-admin-admin-invites.controller';
import { SystemAdminChurchesController } from './system-admin-churches.controller';
import { SystemAdminChurchesService } from './system-admin-churches.service';
import { SystemAdminController } from './system-admin.controller';
import { SystemAdminOrganizationController } from './system-admin-organization.controller';
import { SystemAdminVolunteersController } from './system-admin-volunteers.controller';
import { SystemAdminVolunteersService } from './system-admin-volunteers.service';
import { SupabaseAdminService } from './supabase-admin.service';

@Module({
  imports: [IdentityModule, AdminInviteModule, OrganizationModule],
  controllers: [
    SystemAdminController,
    SystemAdminChurchesController,
    SystemAdminAdminInvitesController,
    SystemAdminVolunteersController,
    SystemAdminOrganizationController,
  ],
  providers: [SystemAdminChurchesService, SystemAdminVolunteersService],
})
export class SystemAdminModule {
  constructor(supabaseAdmin: SupabaseAdminService) {
    supabaseAdmin.logMissingServiceRoleIfNeeded();
  }
}
