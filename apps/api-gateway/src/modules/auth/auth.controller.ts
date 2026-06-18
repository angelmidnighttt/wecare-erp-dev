import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, AUTH_PATTERNS } from '@app/shared';
import { JwtAuthGuard, JwtUser } from '../../common/jwt-auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  // --- Public routes ---
  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authClient.send(AUTH_PATTERNS.REGISTER, body);
  }

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authClient.send(AUTH_PATTERNS.LOGIN, body);
  }

  // --- Protected route: requires a valid JWT ---
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser() user: JwtUser) {
    return this.authClient.send(AUTH_PATTERNS.GET_USER, { id: user.sub });
  }
}
