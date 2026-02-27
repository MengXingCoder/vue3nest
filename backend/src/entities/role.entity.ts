import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from './user-role.entity';
import { RolePermission } from './role-permission.entity';

@Entity('roles')  // 必须添加 @Entity 装饰器
export class Role extends BaseEntity {
  @Column({ length: 50, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 1 })
  level: number;

  @Column({ name: 'is_default', default: false })
  isDefault: boolean;

  @OneToMany(() => UserRole, (userRole) => userRole.role)
  userRoles: UserRole[];

  @OneToMany(() => RolePermission, (rolePermission) => rolePermission.role)
  rolePermissions: RolePermission[];
}