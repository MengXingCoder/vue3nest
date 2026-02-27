import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

//定义基本的实体类，其他实体类可以继承这个基本实体类
export abstract class BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
