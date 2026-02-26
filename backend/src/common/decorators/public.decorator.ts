import { SetMetadata } from '@nestjs/common';

//用于标记控制器方法为公开接口，不进行 JWT 验证
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);