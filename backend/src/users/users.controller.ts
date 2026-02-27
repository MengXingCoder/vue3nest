import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { Public } from 'src/common/decorators/public.decorator';

@ApiTags('用户管理')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: '创建用户' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取单个用户详情' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }
  @Get()
  @ApiOperation({ summary: '获取所有用户' })
  findAll() {
    return this.usersService.findAll();
  }
  @Patch(':id')
  @ApiOperation({ summary: '更新用户' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id);
  }

  @Post(':userId/roles/:roleId')
  @ApiOperation({ summary: '为用户添加角色' })
  addRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.addRole(userId, roleId);
  }

  @Delete(':userId/roles/:roleId')
  @ApiOperation({ summary: '移除用户的角色' })
  removeRole(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('roleId', ParseIntPipe) roleId: number,
  ) {
    return this.usersService.removeRole(userId, roleId);
  }

  @Get(':userId/permissions')
  @ApiOperation({ summary: '获取用户的权限列表' })
  getUserPermissions(@Param('userId', ParseIntPipe) userId: number) {
    return this.usersService.getUserPermissions(userId);
  }
}
