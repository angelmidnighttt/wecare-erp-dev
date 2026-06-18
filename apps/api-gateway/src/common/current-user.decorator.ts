import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUser } from './jwt-auth.guard';

/**
 * Injects the JWT claims attached by JwtAuthGuard, e.g.
 *   create(@CurrentUser() user: JwtUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): JwtUser => {
    return context.switchToHttp().getRequest().user;
  },
);
