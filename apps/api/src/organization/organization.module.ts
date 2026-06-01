import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ChurchController } from './church.controller';
import { ChurchMinistriesController } from './church-ministries.controller';
import { OrganizationContextController } from './organization-context.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { StewardshipModule } from './stewardship.module';

@Module({
  imports: [PrismaModule, IdentityModule, StewardshipModule],
  controllers: [
    ChurchController,
    ChurchMinistriesController,
    OrganizationController,
    OrganizationContextController,
    RolesController,
  ],
  providers: [OrganizationService, RolesService],
  exports: [OrganizationService],
})
export class OrganizationModule {}
