import { Entity, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { UserRole } from './user-role.entity';

@Entity('users')
export class User extends BaseEntity {
  @Column({ length: 50, unique: true })
  username: string;

  @Column({ length: 100, unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  // 一个用户可以有多个角色关联（指向 UserRole 的 user 属性）
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];
}