import { Controller, Get, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Public, CurrentUser, type RequestUser } from '@/platform/decorators';
import { type AuthService } from '../../../application/services/auth.service';
import {
  type LoginRequestDto,
  type RegisterRequestDto,
  type RefreshTokenRequestDto,
  AuthResponseDto,
} from '../../../application/dto/auth.dto';

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
  @ApiResponse({ status: 201, type: AuthResponseDto })
  async register(@Body() dto: RegisterRequestDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login with credentials' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async login(@Body() dto: LoginRequestDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, type: AuthResponseDto })
  async refresh(@Body() dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout and invalidate refresh token' })
  @ApiResponse({ status: 204, description: 'Logged out successfully' })
  async logout(@Body() dto: RefreshTokenRequestDto): Promise<void> {
    return this.authService.logout(dto.refreshToken);
  }

  @Post('logout-all')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Logout from all devices' })
  @ApiResponse({ status: 204, description: 'All sessions invalidated' })
  async logoutAll(@CurrentUser() user: RequestUser): Promise<void> {
    return this.authService.logoutAll(user.userId);
  }
}
