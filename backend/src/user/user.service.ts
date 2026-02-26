import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // 需要先检查用户名和邮箱是否已存在
    const existing = await this.usersRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });
    if (existing) {
      throw new ConflictException('用户名或邮箱已存在');
    }

    // 对用户密码进行加密
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.usersRepository.save(user);
  }

  //根据用户名查找用户
  async findByUsername(username: string) {
    const res = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })

      .getOne();
    return res;
  }

  //根据ID查找用户
  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('用户不存在');
    }
    return user;
  }
  //查找所有用户
  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
  //更新用户信息
  update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    return this.usersRepository.save({ id, ...updateUserDto });
  }
  //删除用户
  remove(id: number) {
    return this.usersRepository.delete(id).then(() => null);
  }
}
