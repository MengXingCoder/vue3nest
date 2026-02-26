import * as Joi from 'joi';
import { EnvKeys } from './env-keys.enum';

// 使用joi校验 避免输错
export const envValidationSchema = Joi.object({
  // 基本应用
  [EnvKeys.NODE_ENV]: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  [EnvKeys.APP_PORT]: Joi.number().default(3000),
  [EnvKeys.API_PREFIX]: Joi.string().default('api'),

  // 数据库
  [EnvKeys.DB_HOST]: Joi.string().required(),
  [EnvKeys.DB_PORT]: Joi.number().required(),
  [EnvKeys.DB_USERNAME]: Joi.string().required(),
  [EnvKeys.DB_PASSWORD]: Joi.string().required(),
  [EnvKeys.DB_DATABASE]: Joi.string().required(),
  [EnvKeys.DB_SYNCHRONIZE]: Joi.boolean().default(false),
  [EnvKeys.DB_LOGGING]: Joi.boolean().default(false),
});