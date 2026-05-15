import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { OrganizationContextController } from './organization-context.controller';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';

@Module({
  imports: [PrismaModule],
  controllers: [OrganizationController, OrganizationContextController],
  providers: [OrganizationService],
})
export class OrganizationModule {}
