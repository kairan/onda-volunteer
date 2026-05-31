import { Module } from '@nestjs/common';
import { IdentityModule } from '../identity/identity.module';
import { SystemAdminController } from './system-admin.controller';

@Module({
  imports: [IdentityModule],
  controllers: [SystemAdminController],
})
export class SystemAdminModule {}
