import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationContextController } from './organization-context.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [PrismaModule, IdentityModule],
  controllers: [OrganizationController, OrganizationContextController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
