import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Menu } from 'src/entities/menu.entity';
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
    // 权限码唯一性检查
    const existingByCode = await this.menuRepository.findOne({
      where: { permissionCode: createMenuDto.permissionCode },
    });
    if (existingByCode) {
      throw new ConflictException('权限码已存在');
    }

    // 同级同名检查
    const whereCondition: any = {
      name: createMenuDto.name,
    };
    if (
      createMenuDto.parentId === undefined ||
      createMenuDto.parentId === null
    ) {
      whereCondition.parentId = IsNull();
    } else {
      whereCondition.parentId = createMenuDto.parentId;
    }

    const sameName = await this.menuRepository.findOne({
      where: whereCondition,
    });
    if (sameName) {
      throw new ConflictException('同级菜单下已存在同名菜单');
    }

    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  // 获取所有菜单（扁平列表）

  async findAll(): Promise<Menu[]> {
    return this.menuRepository.find({ order: { sort: 'ASC' } });
  }

  //获取完整的菜单树（不过滤权限）

  async findMenuTree(): Promise<MenuTreeDto[]> {
    const menus = await this.menuRepository.find({ order: { sort: 'ASC' } });
    return this.buildTree(menus);
  }

  //根据用户权限码列表获取过滤后的菜单树

  async findMenuTreeByPermissions(
    userPermissionCodes: string[],
  ): Promise<MenuTreeDto[]> {
    const menus = await this.menuRepository.find({ order: { sort: 'ASC' } });
    const tree = this.buildTree(menus);
    return this.filterTree(tree, userPermissionCodes);
  }

  //递归构建树形结构

  private buildTree(
    menus: Menu[],
    parentId: number | null = null,
  ): MenuTreeDto[] {
    return menus
      .filter((menu) => menu.parentId === parentId)
      .map((menu) => ({
        id: menu.id,
        name: menu.name,
        icon: menu.icon,
        path: menu.path,
        component: menu.component,
        sort: menu.sort,
        isHidden: menu.isHidden,
        permissionCode: menu.permissionCode,
        children: this.buildTree(menus, menu.id),
      }))
      .sort((a, b) => a.sort - b.sort);
  }

  private filterTree(
    nodes: MenuTreeDto[],
    allowedCodes: string[],
  ): MenuTreeDto[] {
    return nodes
      .map((node) => {
        const filteredChildren = this.filterTree(node.children, allowedCodes);
        const hasSelfPermission = allowedCodes.includes(node.permissionCode);
        if (hasSelfPermission || filteredChildren.length > 0) {
          return {
            ...node,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter((node): node is MenuTreeDto => node !== null);
  }

  //根据 ID 查询单个菜单

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

    // 权限码唯一性检查
    if (
      updateMenuDto.permissionCode &&
      updateMenuDto.permissionCode !== menu.permissionCode
    ) {
      const existing = await this.menuRepository.findOne({
        where: { permissionCode: updateMenuDto.permissionCode },
      });
      if (existing) {
        throw new ConflictException('权限码已存在');
      }
    }

    // 同级同名检查
    if (updateMenuDto.name && updateMenuDto.name !== menu.name) {
      const targetParentId =
        updateMenuDto.parentId !== undefined
          ? updateMenuDto.parentId
          : menu.parentId;

      const whereCondition: any = {
        name: updateMenuDto.name,
      };
      if (targetParentId === null) {
        whereCondition.parentId = IsNull();
      } else {
        whereCondition.parentId = targetParentId;
      }

      const sameName = await this.menuRepository.findOne({
        where: whereCondition,
      });
      if (sameName && sameName.id !== id) {
        throw new ConflictException('同级菜单下已存在同名菜单');
      }
    }

    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }
}
