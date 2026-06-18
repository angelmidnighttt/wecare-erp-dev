import { Module } from '@nestjs/common';
import { ClientsModule } from '@nestjs/microservices';
import { AUTH_SERVICE, redisClientOptions } from '@app/shared';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: AUTH_SERVICE,
        useFactory: redisClientOptions,
      },
    ]),
  ],
  controllers: [AuthController],
})
export class AuthModule {}
