import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from 'src/entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { Menu } from 'src/entities/menu.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto) {
    //需要先判断 是否已有该权限
    const { code } = createPermissionDto;
    const existing = await this.permissionsRepository.findOne({
      where: { code },
    });
    if (existing) {
      throw new Error('该权限编码已存在');
    }
    const permission =
      await this.permissionsRepository.create(createPermissionDto);
    return await this.permissionsRepository.save(permission);
  }
  async syncFromMenus(): Promise<number> {
    // 获取所有非空 permissionCode 的菜单
    const menus = await this.menuRepository.find({
      where: { permissionCode: Not(IsNull()) },
      select: ['permissionCode', 'name'],
    });

    // 获取现有权限码集合
    const existingPermissions = await this.permissionsRepository.find({
      select: ['code'],
    });
    const existingCodes = new Set(existingPermissions.map((p) => p.code));

    const newPermissions: Partial<Permission>[] = [];
    for (const menu of menus) {
      if (menu.permissionCode && !existingCodes.has(menu.permissionCode)) {
        newPermissions.push({
          name: menu.name,
          code: menu.permissionCode,
          description: `菜单权限：${menu.name}`,
        });
      }
    }

    if (newPermissions.length === 0) {
      return 0;
    }

    await this.permissionsRepository.insert(newPermissions);
    return newPermissions.length;
  }
  async findAll() {
    return await this.permissionsRepository.find();
  }

  async findOne(id: number) {
    return await this.permissionsRepository.findOne({ where: { id } });
  }

  async update(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findOne(id);
    if (!permission) {
      throw new Error('权限不存在');
    }
    // 如果更新了 code，需要检查新的 code 是否已存在
    if (
      updatePermissionDto.code &&
      updatePermissionDto.code !== permission.code
    ) {
      const existing = await this.permissionsRepository.findOne({
        where: { code: updatePermissionDto.code },
      });
      if (existing) {
        throw new ConflictException('权限编码已存在');
      }
    }
    Object.assign(permission, updatePermissionDto);
    return await this.permissionsRepository.save(permission);
  }

  async remove(id: number) {
    return await this.permissionsRepository.delete(id);
  }
}
