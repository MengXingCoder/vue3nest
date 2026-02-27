import { Entity, ManyToOne, JoinColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';
import { User } from './user.entity';
import { Role } from './role.entity';

@Entity('user_roles')
export class UserRole extends BaseEntity {
  @ManyToOne(() => User, (user) => user.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => Role, (role) => role.userRoles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role: Role;

  @Column({ name: 'role_id' })
  roleId: number;

  @Column({ name: 'assigned_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  assignedAt: Date;
}