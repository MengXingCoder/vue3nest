import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SeedService } from './seed.service';
import { CreateSeedDto } from './dto/create-seed.dto';
import { UpdateSeedDto } from './dto/update-seed.dto';

import { PermissionsService } from '../permissions/permissions.service';
import { RolesService } from '../roles/roles.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
@Controller('seed')
export class SeedController {
  constructor(
    private seedService: SeedService,
    private permissionsService: PermissionsService,
    private rolesService: RolesService,
  ) {}

  @Post('sync-permissions')
  @Roles('root') // 仅 root 可调用
  @ApiOperation({ summary: '同步菜单权限到权限表' })
  async syncPermissions() {
    const count = await this.permissionsService.syncFromMenus();
    return { message: `同步完成，新增 ${count} 条权限记录` };
  }

  @Post('assign-default-permissions')
  @Roles('root')
  @ApiOperation({ summary: '为 root/admin/user 分配默认权限' })
  async assignDefaultPermissions() {
    await this.rolesService.assignDefaultPermissions();
    return { message: '默认权限分配完成' };
  }

  @Post()
  create(@Body() createSeedDto: CreateSeedDto) {
    return this.seedService.create(createSeedDto);
  }

  @Get()
  findAll() {
    return this.seedService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seedService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSeedDto: UpdateSeedDto) {
    return this.seedService.update(+id, updateSeedDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.seedService.remove(+id);
  }
}
