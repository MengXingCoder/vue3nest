import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { RolePermission } from './role-permission.entity';

@Entity('permissions')
export class Permission extends BaseEntity {
  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  code: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => RolePermission, (rp) => rp.permission)
  rolePermissions: RolePermission[];
}