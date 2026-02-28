import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { type Request } from 'express';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/common/decorators/roles.decorator';
import { UsersService } from 'src/users/users.service';

@ApiTags('菜单管理')
@ApiBearerAuth()
@Controller('menus')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @Roles('root')
  @ApiOperation({ summary: '创建菜单' })
  create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(createMenuDto);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取当前用户的菜单树' })
  async getTree(@Req() req: Request) {
    // 从请求中获取当前用户
    const user = req.user as { id: number } | undefined;
    if (!user) {
      return [];
    }

    return await this.usersService
      .getUserPermissions(user.id)
      .then(async (permissions) => {
        return await this.menusService.findMenuTreeByPermissions(permissions);
      });
  }

  @Get('all')
  @Roles('root')
  @ApiOperation({ summary: '获取所有菜单（扁平列表）' })
  findAll() {
    return this.menusService.findAll();
  }

  @Get('tree/all')
  @Roles('root')
  @ApiOperation({ summary: '获取完整的菜单树' })
  findAllTree() {
    return this.menusService.findMenuTree();
  }

  @Get(':id')
  @Roles('root')
  @ApiOperation({ summary: '获取单个菜单' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.findOne(id);
  }

  @Patch(':id')
  @Roles('root')
  @ApiOperation({ summary: '更新菜单' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Roles('root')
  @ApiOperation({ summary: '删除菜单' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.remove(id);
  }
}
