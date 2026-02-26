import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';

//根据当前环境不同，返回不同的文件列表  
//  development环境加载 .env 和 .env.development 文件，
// production环境加载 .env 和 .env.production 文件

//合并环境配置文件
export const envFilePath = ['.env', `.env.${process.env.NODE_ENV || 'development'}`];

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 全局模块，
      envFilePath,
      validationSchema: envValidationSchema,
    
    }),
  ],
})
export class ConfigurationModule {}