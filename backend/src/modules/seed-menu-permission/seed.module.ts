import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { RolesModule } from '../roles/roles.module';
import { PermissionsModule } from '../permissions/permissions.module';

@Module({
    imports: [RolesModule,PermissionsModule],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
