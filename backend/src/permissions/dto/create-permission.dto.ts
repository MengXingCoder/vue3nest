import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt } from 'class-validator';

export class CreatePermissionDto {
  @ApiProperty({ example: '创建用户' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'user:create' })
  @IsString()
  code: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;


}