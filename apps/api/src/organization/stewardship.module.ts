import { forwardRef, Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { IdentityModule } from '../identity/identity.module';
import { StewardshipService } from './stewardship.service';

@Module({
  imports: [PrismaModule, forwardRef(() => IdentityModule)],
  providers: [StewardshipService],
  exports: [StewardshipService],
})
export class StewardshipModule {}
