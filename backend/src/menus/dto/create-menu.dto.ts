import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean, Min, MaxLength } from 'class-validator';

export class CreateMenuDto {
  @ApiProperty({ example: '用户管理' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ required: false, example: 'user' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  icon?: string;

  @ApiProperty({ required: false, example: '/system/user' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  path?: string;

  @ApiProperty({ required: false, example: 'system/user/index' })
  @IsOptional()
  @IsString()
  component?: string;

  @ApiProperty({ required: false, description: '父菜单ID' })
  @IsOptional()
  @IsInt()
  parentId?: number | null;

  @ApiProperty({ default: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  sort?: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @ApiProperty({ example: 'system:user' })
  @IsString()
  @MaxLength(100)
  permissionCode: string;
}