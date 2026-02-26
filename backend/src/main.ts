import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configservice = app.get(ConfigService);
  const API_PREFIX = configservice.get<string>('API_PREFIX', 'api');
  app.setGlobalPrefix(API_PREFIX);
  const APP_PORT = configservice.get<number>('APP_PORT', 3000);
  // Swagger 配置
  const swaggerConfig = new DocumentBuilder()
    .setTitle('后台管理系统 API')
    .setDescription('用户认证、管理等接口')
    .setVersion('1.0')
    .addBearerAuth() // 添加 Bearer 认证支持
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api-docs', app, document);
  console.log(`Swagger docs: http://localhost:${APP_PORT}/${API_PREFIX}-docs`);
  await app.listen(APP_PORT, '0.0.0.0');
}
bootstrap();
