import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { PrismaModule } from '../prisma/prisma.module';
import { SystemAdminChurchesController } from './system-admin-churches.controller';
import { SystemAdminChurchesService } from './system-admin-churches.service';
import { SystemAdminController } from './system-admin.controller';

@Module({
  imports: [IdentityModule, PrismaModule],
  controllers: [SystemAdminController, SystemAdminChurchesController],
  providers: [SystemAdminChurchesService],
})
export class SystemAdminModule {}
