import { forwardRef, Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from '../prisma/prisma.module';
import { StewardshipModule } from '../organization/stewardship.module';
import { AuthContextInterceptor } from './auth-context.interceptor';
import { AuthContextResolverService } from './auth-context-resolver.service';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { SupabaseJwtVerifier } from './supabase-jwt-verifier';

@Global()
@Module({
  imports: [PrismaModule, forwardRef(() => StewardshipModule)],
  controllers: [IdentityController],
  providers: [
    SupabaseJwtVerifier,
    IdentityService,
    AuthContextResolverService,
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthContextInterceptor,
    },
  ],
  exports: [IdentityService, AuthContextResolverService],
})
export class IdentityModule {}
