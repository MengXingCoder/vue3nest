import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/user-role.entity';
import { RolesModule } from '../roles/roles.module';
import { Role } from 'src/entities/role.entity';
import { MenusModule } from 'src/menus/menus.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole, Role]),
    RolesModule,
    forwardRef(() => MenusModule),
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
