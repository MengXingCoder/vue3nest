import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Role } from './role.entity';
import { Permission } from './permission.entity';

@Entity('role_permissions')
export class RolePermission extends BaseEntity {
  @ManyToOne(() => Role, (role) => role.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: number;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'permission_id' })
  permission: Permission;

  @Column({ name: 'permission_id' })
  permissionId: number;
}