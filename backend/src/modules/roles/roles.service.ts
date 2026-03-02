import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Role } from 'src/entities/role.entity';
import { RolePermission } from 'src/entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Permission } from 'src/entities/permission.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    @InjectRepository(RolePermission)
    private rolePermissionRepository: Repository<RolePermission>,
    private dataSource: DataSource,
    @InjectRepository(Permission)
    private permissionsRepository: Repository<Permission>,
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
   * 为指定角色分配权限（通过权限码列表）
   * @param roleName 角色名称
   * @param permissionCodes 权限码数组
   */
  async assignPermissionsByCodes(
    roleName: string,
    permissionCodes: string[],
  ): Promise<void> {
    // 1. 查找角色
    const role = await this.rolesRepository.findOne({
      where: { name: roleName },
    });
    if (!role) {
      throw new NotFoundException(`角色 ${roleName} 不存在`);
    }

    // 2. 根据权限码查找对应的权限ID
    const permissions = await this.permissionsRepository.find({
      where: { code: In(permissionCodes) },
    });

    // 如果某些权限码不存在，可以记录日志或忽略（此处简单忽略）
    const foundCodes = permissions.map((p) => p.code);
    const missing = permissionCodes.filter(
      (code) => !foundCodes.includes(code),
    );
    if (missing.length > 0) {
      console.warn(`以下权限码未找到，将被忽略：${missing.join(', ')}`);
    }

    // 3. 先删除该角色的所有权限（若需要覆盖分配）
    await this.rolePermissionRepository.delete({ roleId: role.id });

    // 4. 创建新的关联
    const rolePermissions = permissions.map((permission) =>
      this.rolePermissionRepository.create({
        roleId: role.id,
        permissionId: permission.id,
      }),
    );
    await this.rolePermissionRepository.save(rolePermissions);
  }
  
    // 初始化默认角色权限（按业务需求）
    // 为 root、admin、user 分配预设的权限码
   
  async assignDefaultPermissions(): Promise<void> {
    // 定义各角色的权限码列表（根据您的需求）
    const rootPermissions = await this.getAllPermissionCodes(); // root 拥有全部
    const adminPermissions = [
      // 系统管理：用户管理、角色管理（页面）
      'system:user',
      'system:role',
      // 通知公告：所有页面和按钮
      'notice:company',
      'notice:company:add',
      'notice:company:edit',
      'notice:company:delete',
      'notice:dept',
      'notice:dept:add',
      'notice:dept:edit',
      'notice:dept:delete',
      // 功能模块：所有页面和按钮
      'function:file',
      'function:file:add',
      'function:file:edit',
      'function:file:delete',
      'function:text',
      'function:text:add',
      'function:text:edit',
      'function:text:delete',
      'function:qrcode',
      'function:qrcode:add',
      'function:qrcode:edit',
      'function:qrcode:delete',
      // 组件中心：图表、地图页面及编辑按钮
      'component:chart',
      'component:chart:edit',
      'component:map',
      'component:map:edit',
      // 运维管理：服务器管理页面及编辑按钮
      'ops:server',
      'ops:server:edit',
      // 个人中心：所有页面
      'profile:info',
      'profile:password',
    ];
    const userPermissions = [
      // 通知公告：所有页面和按钮
      'notice:company',
      'notice:company:add',
      'notice:company:edit',
      'notice:company:delete',
      'notice:dept',
      'notice:dept:add',
      'notice:dept:edit',
      'notice:dept:delete',
      // 功能模块：页面 + 新增/编辑（无删除）
      'function:file',
      'function:file:add',
      'function:file:edit',
      'function:text',
      'function:text:add',
      'function:text:edit',
      'function:qrcode',
      'function:qrcode:add',
      'function:qrcode:edit',
      // 组件中心：页面（无按钮）
      'component:chart',
      'component:map',
      // 个人中心：所有页面
      'profile:info',
      'profile:password',
    ];

    await this.assignPermissionsByCodes('root', rootPermissions);
    await this.assignPermissionsByCodes('admin', adminPermissions);
    await this.assignPermissionsByCodes('user', userPermissions);
  }

  /**
   * 获取所有权限码（用于 root）
   */
  private async getAllPermissionCodes(): Promise<string[]> {
    const permissions = await this.permissionsRepository.find({
      select: ['code'],
    });
    return permissions.map((p) => p.code);
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
    let defaultRole = await this.rolesRepository.findOne({
      where: { isDefault: true },
    });
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
  async assignPermissions(
    roleId: number,
    permissionIds: number[],
  ): Promise<void> {
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
