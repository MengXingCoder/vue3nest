import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private dataSource: DataSource,
  ) {}

  /**
   * 创建角色
   */
  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    const existing = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existing) {
      throw new ConflictException('角色名称已存在');
    }
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  /**
   * 查询所有角色
   */
  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  /**
   * 根据ID查询角色（包含权限关联）
   */
  async findOne(id: number): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ['rolePermissions', 'rolePermissions.permission'],
    });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    return role;
  }

  /**
   * 根据名称查找角色
   */
  async findByName(name: string) {
    return this.rolesRepository.findOne({ where: { name } });
  }

  /**
   * 获取默认角色
   */
  async findDefaultRole(): Promise<Role> {
    let defaultRole = await this.rolesRepository.findOne({ where: { isDefault: true } });
    if (!defaultRole) {
      defaultRole = await this.rolesRepository.findOne({
        order: { level: 'ASC' },
      });
    }
    if (!defaultRole) {
      throw new NotFoundException('系统中没有角色，请先初始化角色数据');
    }
    return defaultRole;
  }

  /**
   * 更新角色
   */
  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existing = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      if (existing) {
        throw new ConflictException('角色名称已存在');
      }
    }
    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  /**
   * 删除角色（级联删除关联表记录）
   */
  async remove(id: number): Promise<void> {
    const role = await this.findOne(id);
    await this.rolesRepository.remove(role);
  }

  /**
   * 为角色分配权限（事务）
   */
  async assignPermissions(roleId: number, permissionIds: number[]): Promise<void> {
    const role = await this.findOne(roleId);
    if (!role) throw new NotFoundException('角色不存在');

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(RolePermission, { roleId });
      const rolePermissions = permissionIds.map((permissionId) =>
        manager.create(RolePermission, { roleId, permissionId }),
      );
      await manager.save(rolePermissions);
    });
  }

  /**
   * 获取角色的权限ID列表
   */
  async getPermissionIds(roleId: number): Promise<number[]> {
    const rps = await this.rolePermissionRepository.find({
      where: { roleId },
      select: ['permissionId'],
    });
    return rps.map((rp) => rp.permissionId);
  }
}