import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE, tcpClientOptions } from '@app/shared';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: () => tcpClientOptions('AUTH'),
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
