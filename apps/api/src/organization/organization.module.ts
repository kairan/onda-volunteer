import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationContextController } from './organization-context.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [
    OrganizationController,
    OrganizationContextController,
    RolesController,
  ],
  providers: [OrganizationService, RolesService],
})
export class OrganizationModule {}
