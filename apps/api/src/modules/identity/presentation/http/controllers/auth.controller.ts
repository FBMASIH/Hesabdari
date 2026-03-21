import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public, CurrentUser, type RequestUser } from '@/platform/decorators';
import { AuthService } from '../../../application/services/auth.service';
import { loginSchema, registerSchema, refreshTokenSchema } from '@hesabdari/contracts';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile with organizations' })
  async profile(@CurrentUser() user: RequestUser) {
    return this.authService.getProfile(user.userId);
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  async register(@Body() body: unknown) {
    const data = registerSchema.parse(body);
    return this.authService.register(data);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  async login(@Body() body: unknown) {
    const data = loginSchema.parse(body);
    return this.authService.login(data);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() body: unknown) {
    const { refreshToken } = refreshTokenSchema.parse(body);
    return this.authService.refreshToken(refreshToken);
  }

  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  async logout(@Body() body: unknown): Promise<void> {
    const { refreshToken } = refreshTokenSchema.parse(body);
    return this.authService.logout(refreshToken);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout from all devices' })
  async logoutAll(@CurrentUser() user: RequestUser): Promise<void> {
    return this.authService.logoutAll(user.userId);
  }
}
