import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { AdminInviteService } from './admin-invite.service';
import { SupabaseAdminService } from './supabase-admin.service';

@Module({
  imports: [PrismaModule],
  providers: [AdminInviteService, SupabaseAdminService],
  exports: [AdminInviteService, SupabaseAdminService],
})
export class AdminInviteModule {}
