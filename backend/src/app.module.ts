import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationModule } from './config/configuration.module';
import { EnvKeys } from './config/env-keys.enum';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MenusModule } from './menus/menus.module';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [
    ConfigurationModule,

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>(EnvKeys.DB_HOST),
        port: configService.get<number>(EnvKeys.DB_PORT),
        username: configService.get<string>(EnvKeys.DB_USERNAME),
        password: configService.get<string>(EnvKeys.DB_PASSWORD),
        database: configService.get<string>(EnvKeys.DB_DATABASE),
        entities: [__dirname + '/**/*.entity{.ts,.js}'], //加载所有的实体文件 映射入数据库中表，或者也可以手动加载实体文件
        synchronize: configService.get<boolean>(EnvKeys.DB_SYNCHRONIZE),
        logging: configService.get<boolean>(EnvKeys.DB_LOGGING),
      }),
    }),
    UsersModule,
    AuthModule,
    RolesModule,
    PermissionsModule,
    MenusModule,
  ],
  providers: [
    // 全局注册 JWT 守卫（除了 @Public() 接口）
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
