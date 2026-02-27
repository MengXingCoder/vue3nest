import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  //用户注册
  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  //用户登录
  async login(loginDto: LoginDto) {
    // 1. 根据用户名查找用户（包含密码字段）
    const user = await this.usersService.findByUsername(loginDto.username, true);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 2. 比对密码
    const isMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    // 3. 检查用户状态
    if (!user.isActive) {
      throw new UnauthorizedException('用户已被禁用');
    }

    // 4. 生成 JWT payload
    const payload = { sub: user.id, username: user.username, role: user.role };

    // 5. 签名 token
    const access_token = this.jwtService.sign(payload);

    // 6. 返回 token 和用户基本信息
    return {
      access_token,
    };
  }
}
