import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { ConflictError } from '@/platform/errors';
import type { LoginDto, RegisterDto } from '@hesabdari/contracts';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const exists = await this.userRepository.existsByEmail(dto.email);
    if (exists) {
      throw new ConflictError('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 12);
    const user = await this.userRepository.create({
      email: dto.email,
      hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      isActive: true,
    });

    return this.generateTokens(user.id, user.email);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.hashedPassword);
    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateTokens(user.id, user.email);
  }

  async refreshToken(refreshToken: string) {
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    await this.sessionRepository.delete(session.id);
    return this.generateTokens(session.userId, '');
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const refreshExpDays = parseInt(
      this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d').replace('d', ''),
    );
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + refreshExpDays);

    await this.sessionRepository.create({
      userId,
      refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
