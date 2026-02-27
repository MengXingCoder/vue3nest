import { ConflictException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from 'src/entities/permission.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
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
