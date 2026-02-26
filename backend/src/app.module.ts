import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationModule } from './config/configuration.module';
import { EnvKeys } from './config/env-keys.enum';
import { UserModule } from './user/user.module';

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
    }), UserModule,
  ],
})
export class AppModule {}