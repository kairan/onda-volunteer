import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IdentityService } from './identity.service';
import { SupabaseJwtVerifier } from './supabase-jwt-verifier';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [SupabaseJwtVerifier, IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
