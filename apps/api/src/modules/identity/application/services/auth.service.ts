import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { SessionRepository } from '../../infrastructure/repositories/session.repository';
import { ConflictError } from '@/platform/errors';
import type { LoginDto, RegisterDto } from '@hesabdari/contracts';

/** Parse a duration string like '7d', '24h', '30m' into milliseconds. */
function parseDurationMs(value: string): number {
  const match = value.match(/^(\d+)\s*(d|h|m|s)$/i);
  if (!match || !match[1] || !match[2]) {
    throw new Error(`Invalid duration format: "${value}". Expected format: <number><d|h|m|s>`);
  }
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = { s: 1_000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  const ms = multipliers[unit];
  if (ms === undefined) {
    throw new Error(`Unknown duration unit: "${unit}"`);
  }
  return amount * ms;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async getProfile(userId: string) {
    const user = await this.userRepository.findByIdWithOrganizations(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      organizations: user.memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        role: m.role.name,
      })),
    };
  }

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

    // Delete the consumed session (rotation: old token is single-use)
    await this.sessionRepository.delete(session.id);

    // Fetch the user to get current email for the new JWT payload
    const user = await this.userRepository.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User account is inactive');
    }

    return this.generateTokens(user.id, user.email);
  }

  async logout(refreshToken: string): Promise<void> {
    const session = await this.sessionRepository.findByRefreshToken(refreshToken);
    if (session) {
      await this.sessionRepository.delete(session.id);
    }
    // Silently succeed even if token not found — logout is idempotent
  }

  async logoutAll(userId: string): Promise<void> {
    await this.sessionRepository.deleteAllForUser(userId);
  }

  private async generateTokens(userId: string, email: string) {
    const payload = { sub: userId, email };
    const accessToken = this.jwtService.sign(payload);

    const refreshToken = crypto.randomUUID();
    const refreshExpStr = this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d');
    const refreshExpMs = parseDurationMs(refreshExpStr);
    const expiresAt = new Date(Date.now() + refreshExpMs);

    await this.sessionRepository.create({
      userId,
      refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  }
}
