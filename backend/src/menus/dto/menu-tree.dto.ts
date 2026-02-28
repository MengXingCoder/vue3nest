import { ApiProperty } from '@nestjs/swagger';

export class MenuTreeDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  icon?: string;

  @ApiProperty({ required: false })
  path?: string;

  @ApiProperty({ required: false })
  component?: string;

  @ApiProperty()
  sort: number;

  @ApiProperty()
  isHidden: boolean;

  @ApiProperty()
  permissionCode: string;

  @ApiProperty({ type: [MenuTreeDto] })
  children: MenuTreeDto[];
}