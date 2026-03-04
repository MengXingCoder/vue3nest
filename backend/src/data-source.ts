import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

// 加载环境变量（根据 NODE_ENV 加载对应的 .env 文件）
config({
  path: join(process.cwd(), `.env.${process.env.NODE_ENV || 'development'}`),
});
// 同时加载公共 .env 文件（如果存在）
config({ path: join(process.cwd(), '.env') });

// export const envFilePath = ['.env', `.env.${process.env.NODE_ENV || 'development'}`];

console.log('Entities path pattern:', join(__dirname, '/**/*.entity{.ts,.js}'));
export default new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: 3306,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, '/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '/migrations/*{.ts,.js}')],

  synchronize: false, // 迁移时务必关闭自动同步
  logging: process.env.DB_LOGGING === 'true',
});
