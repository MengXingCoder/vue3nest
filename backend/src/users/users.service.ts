import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from 'src/entities/user.entity';
import { UserRole } from 'src/entities/user-role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { RolesService } from '../roles/roles.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    private rolesService: RolesService,
    private dataSource: DataSource,
  ) {}

  /**
   * 获取用户的完整资料（包含角色和权限）
   */
  private async getUserProfile(id: number, manager?: any): Promise<any> {
    const repo = manager ? manager.getRepository(User) : this.usersRepository;
    const user = await repo.findOne({
      where: { id },
      relations: [
        'userRoles',
        'userRoles.role',
        'userRoles.role.rolePermissions',
        'userRoles.role.rolePermissions.permission',
      ],
    });
    if (!user) throw new NotFoundException('用户不存在');

    // 提取角色列表
    const roles = user.userRoles.map((ur) => ({
      id: ur.role.id,
      name: ur.role.name,
      level: ur.role.level,
    }));

    // 提取权限代码（去重）
    const permissionSet = new Set<string>();
    for (const ur of user.userRoles) {
      for (const rp of ur.role.rolePermissions || []) {
        if (rp.permission?.code) permissionSet.add(rp.permission.code);
      }
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      roles,
      permissions: Array.from(permissionSet),
    };
  }

  /**
   * 创建用户（事务）
   */
  async create(createUserDto: CreateUserDto): Promise<any> {
    // 检查用户名/邮箱唯一性
    const existing = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existing) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    return this.dataSource.transaction(async (manager) => {
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
      const user = manager.create(User, {
        username: createUserDto.username,
        email: createUserDto.email,
        password: hashedPassword,
      });
      const savedUser = await manager.save(user);

      // 确定角色
      let roleId = createUserDto.roleId;
      if (!roleId) {
        const defaultRole = await this.rolesService.findDefaultRole();
        roleId = defaultRole.id;
      }

      const userRole = manager.create(UserRole, {
        userId: savedUser.id,
        roleId,
      });
      await manager.save(userRole);

      return this.getUserProfile(savedUser.id, manager);
    });
  }

  /**
   * 查询所有用户（基础信息）
   */
  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  /**
   * 根据ID查询用户详情（包含角色和权限）
   */
  async findOne(id: number): Promise<any> {
    return this.getUserProfile(id);
  }

  /**
   * 根据用户名查找用户（用于登录验证）
   */
  async findByUsername(username: string, includePassword = false) {
    const query = this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username });
    if (includePassword) {
      query.addSelect('user.password');
    }
    return query.getOne();
  }

  /**
   * 更新用户信息（事务，可更新角色）
   */
  async update(id: number, updateUserDto: UpdateUserDto): Promise<any> {
      const user = await this.usersRepository.findOne({ where: { id } });
      console.log('更新用户info',user);
    if (!user) throw new NotFoundException('用户不存在');

    return this.dataSource.transaction(async (manager) => {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
      }
        Object.assign(user, updateUserDto);
        console.log('更新用户后info',Object.assign(user, updateUserDto));
      await manager.save(user);

      if (updateUserDto.roleId) {
        // 删除原有角色关联
        await manager.delete(UserRole, { userId: id });
        // 添加新角色
        const userRole = manager.create(UserRole, {
          userId: id,
          roleId: updateUserDto.roleId,
        });
        await manager.save(userRole);
      }

      return this.getUserProfile(id, manager);
    });
  }

  /**
   * 删除用户
   */
  async remove(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('用户不存在');
    await this.usersRepository.remove(user);
  }

  /**
   * 为用户添加一个角色（多角色）
   */
  async addRole(userId: number, roleId: number): Promise<void> {
    const existing = await this.userRoleRepository.findOne({
      where: { userId, roleId },
    });
    if (existing) {
      throw new ConflictException('用户已有该角色');
    }
    const userRole = this.userRoleRepository.create({ userId, roleId });
    await this.userRoleRepository.save(userRole);
  }

  /**
   * 移除用户的某个角色
   */
  async removeRole(userId: number, roleId: number): Promise<void> {
    await this.userRoleRepository.delete({ userId, roleId });
  }

  /**
   * 获取用户的权限代码列表
   */
  async getUserPermissions(userId: number): Promise<string[]> {
    const profile = await this.getUserProfile(userId);
    return profile.permissions;
  }
}
