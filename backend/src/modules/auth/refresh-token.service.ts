import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RefreshToken } from 'src/entities/refresh-token.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class RefreshTokenService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  /**
   * 生成并保存refresh token
   * @param user 用户实体
   * @param userAgent 客户端User-Agent
   * @param ipAddress 客户端IP
   * @returns 生成的token字符串
   */
  async generateRefreshToken(
    user: User,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<string> {


    const token = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7天过期
   
      // 创建refreshToken并保存到数据库
    const refreshToken = this.refreshTokenRepository.create({
      token,
      user,
      userId: user.id,
      expiresAt,
      userAgent,
      ipAddress,
      isRevoked: false,
    });

    await this.refreshTokenRepository.save(refreshToken);
    return token;
  }

  /**
   * 验证refresh token是否有效，若有效则返回包含用户信息的token实体
   */
  async validateRefreshToken(token: string): Promise<RefreshToken> {
    const refreshToken = await this.refreshTokenRepository.findOne({
      where: { token, isRevoked: false },
      relations: ['user'],
    });

    if (!refreshToken) {
      throw new UnauthorizedException('无效的refresh token');
    }

    if (refreshToken.expiresAt < new Date()) {
      // 过期后自动删除
      await this.refreshTokenRepository.remove(refreshToken);
      throw new UnauthorizedException('refresh token已过期');
    }

    return refreshToken;
  }

  /**
   * 吊销指定的refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.refreshTokenRepository.update({ token }, { isRevoked: true });
  }

  /**
   * 吊销用户的所有refresh tokens（用于修改密码、注销等）
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.refreshTokenRepository.update(
      { userId, isRevoked: false },
      { isRevoked: true },
    );
  }
}