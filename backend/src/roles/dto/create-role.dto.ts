import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'admin' })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ default: 1 })
  @IsOptional()
  @IsInt()
  level?: number;

  @ApiProperty({ default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}