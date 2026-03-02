import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuTreeDto } from './dto/menu-tree.dto';

@Injectable()
export class MenusService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}



  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const existing = await this.menuRepository.findOne({
      where: { permissionCode: createMenuDto.permissionCode },
    });
    if (existing) {
      throw new ConflictException('权限码已存在');
    }
    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({ order: { sort: 'ASC' } });
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }
    return menu;
  }

  async update(id: number, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    if (updateMenuDto.permissionCode && updateMenuDto.permissionCode !== menu.permissionCode) {
      const existing = await this.menuRepository.findOne({
        where: { permissionCode: updateMenuDto.permissionCode },
      });
      if (existing) {
        throw new ConflictException('权限码已存在');
      }
    }
    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }



  /**
   * 获取完整的菜单树（不过滤权限）
   * 只包含页面节点（isHidden = false），把按钮权限统一处理到父节点的 permissionCodes 中
   */
  async findMenuTree(): Promise<MenuTreeDto[]> {
    const menus = await this.menuRepository.find({ order: { sort: 'ASC' } });
    return this.buildAggregatedTree(menus);
  }

  /**
   * 根据用户权限码列表获取过滤后的菜单树
   * @param userPermissions 用户拥有的权限码数组
   */
  async findMenuTreeByPermissions(userPermissions: string[]): Promise<MenuTreeDto[]> {
    const fullTree = await this.findMenuTree();
    return this.filterTree(fullTree, userPermissions);
  }

  /**
   * 构建聚合树：只保留页面节点（isHidden = false），并收集其下属按钮的权限码
   */
  private buildAggregatedTree(allMenus: Menu[], parentId: number | null = null): MenuTreeDto[] {
    return allMenus
      .filter(menu => menu.parentId === parentId && !menu.isHidden) // 只取页面节点
      .map(menu => {
        // 递归构建子页面
        const children = this.buildAggregatedTree(allMenus, menu.id);

        // 收集当前页面自身的权限码
        const permissionCodes = menu.permissionCode ? [menu.permissionCode] : [];

        // 收集当前页面下所有按钮的权限码（直接子节点且 isHidden = true）
        const buttons = allMenus.filter(m => m.parentId === menu.id && m.isHidden);
        buttons.forEach(btn => {
          if (btn.permissionCode) permissionCodes.push(btn.permissionCode);
        });

        return {
          id: menu.id,
          name: menu.name,
          path: menu.path,
          component: menu.component,
          icon: menu.icon,
          sort: menu.sort,
          hidden: menu.isHidden,
          permissionCodes,
          children,
        };
      })
      .sort((a, b) => a.sort - b.sort);
  }

  /**
   * 递归过滤树：保留节点当且仅当节点有权限（permissionCodes 与用户权限有交集）或其子节点有权限
   */
  private filterTree(nodes: MenuTreeDto[], userPermissions: string[]): MenuTreeDto[] {
    return nodes
      .map(node => {
        const filteredChildren = this.filterTree(node.children, userPermissions);
        const hasSelfPermission = node.permissionCodes.some(code => userPermissions.includes(code));
        if (hasSelfPermission || filteredChildren.length > 0) {
          return { ...node, children: filteredChildren };
        }
        return null;
      })
      .filter((node): node is MenuTreeDto => node !== null);
  }
}