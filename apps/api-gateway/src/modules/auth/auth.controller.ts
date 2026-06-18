import { Body, Controller, Get, Inject, Param, Post } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { AUTH_SERVICE, AUTH_PATTERNS } from '@app/shared';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AUTH_SERVICE) private readonly authClient: ClientProxy,
  ) {}

  @Post('register')
  register(@Body() body: { email: string; password: string }) {
    return this.authClient.send(AUTH_PATTERNS.REGISTER, body);
  }

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.authClient.send(AUTH_PATTERNS.GET_USER, { id });
  }
}
