import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('menus')
export class Menu extends BaseEntity {
  @Column({ length: 50 })
  name: string;

  @Column({ length: 100, nullable: true })
  icon: string;

  @Column({ length: 200, nullable: true })
  path: string;

  @Column({ nullable: true })
  component: string;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  @Column({ default: 0 })
  sort: number;

  @Column({ name: 'is_hidden', default: false })
  isHidden: boolean;

  @Column({ name: 'permission_code', length: 100, unique: true })
  permissionCode: string;

  @ManyToOne(() => Menu, (menu) => menu.children, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'parent_id' })
  parent: Menu |null;

  @OneToMany(() => Menu, (menu) => menu.parent)
  children: Menu[];
}