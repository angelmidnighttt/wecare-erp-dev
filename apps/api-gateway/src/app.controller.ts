import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return 'Hello World from API Gateway 👋';
  }

  @Get('health')
  health() {
    return { status: 'ok', service: 'api-gateway' };
  }
}
