import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/user-role.entity';
import { RolesModule } from '../roles/roles.module';
import { Role } from 'src/entities/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, UserRole,Role]),
    RolesModule, 
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}