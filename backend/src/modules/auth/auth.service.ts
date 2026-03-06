import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/modules/users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenService } from './refresh-token.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private refreshTokenService: RefreshTokenService,
  ) {}

  //用户注册
  async register(registerDto: RegisterDto) {
    return this.usersService.create(registerDto);
  }

  //用户登录
  async login(loginDto: LoginDto) {
    // 1. 根据用户名查找用户（包含密码字段）
    const user = await this.usersService.findByUsername(
      loginDto.username,
      true,
    );

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
    // 4. 获取用户信息（包含角色和权限）
    const profile = await this.usersService.findOne(user.id); // findOne 返回包含 roles 的对象

    // 5. 构造 JWT payload
    const payload = {
      sub: profile.id,
      username: profile.username,
      roles: profile.roles.map((role) => role.name), // 角色名称数组
      permissions: profile.permissions,
    };

    console.log('jwt payload', payload);
    // 5. 签名 token

    const access_token = this.jwtService.sign(payload, { expiresIn: '30m' });
    const refresh_token =
      await this.refreshTokenService.generateRefreshToken(user);

    // 6. 返回 token 和用户基本信息
    return {
      data: {
        access_token,
        refresh_token,
      },
    };
  }
  async refreshAccessToken(refreshToken: string) {
    // 检查这个refresh token是否还有效
    const tokenEntity =
      await this.refreshTokenService.validateRefreshToken(refreshToken);
    const user = tokenEntity.user;

    await this.refreshTokenService.revokeRefreshToken(refreshToken); // 作废旧token
    const newRefreshToken =
      await this.refreshTokenService.generateRefreshToken(user); //生成新的refresh token

    // 获取最新用户信息（包含权限）
    const profile = await this.usersService.findOne(user.id);
    const accessPayload = {
      sub: profile.id,
      username: profile.username,
      roles: profile.roles.map((r) => r.name),
      permissions: profile.permissions,
    };
    const newAccessToken = this.jwtService.sign(accessPayload, {
      expiresIn: '15m',
    });

    return {
      data: {
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      },
    };
  }
}
