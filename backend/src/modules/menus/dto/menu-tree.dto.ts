import { ApiProperty } from '@nestjs/swagger';

export class MenuTreeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  path?: string;

  @ApiProperty({ required: false })
  component?: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty()
  sort: number;

  @ApiProperty()
  hidden: boolean;           // 对应 isHidden，侧边栏隐藏项

  @ApiProperty({ type: [String] })
  permissionCodes: string[]; // 该页面拥有的所有权限码（包括页面自身和页面所属的按钮）

  @ApiProperty({ type: [MenuTreeDto] })
  children: MenuTreeDto[];
}