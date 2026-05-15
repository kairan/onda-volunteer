import { Global, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { SupabaseJwtVerifier } from './supabase-jwt-verifier';

@Global()
@Module({
  imports: [PrismaModule],
  controllers: [IdentityController],
  providers: [SupabaseJwtVerifier, IdentityService],
  exports: [IdentityService],
})
export class IdentityModule {}
