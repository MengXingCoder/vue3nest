import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  username: string; // 用户名，唯一

  @Column({ length: 100, unique: true })
  email: string; // 邮箱，唯一

  @Column({ select: false }) // 默认查询不返回密码字段
  @Exclude() // 当使用 class-transformer 将实例转换为普通对象时排除此字段
  password: string; // 加密后的密码

  @Column({ name: 'is_active', default: true })
  isActive: boolean; // 用户是否启用

  @Column({ nullable: true })
  role?: string; // 简单角色字段，例如 'admin', 'user', 'root'

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}