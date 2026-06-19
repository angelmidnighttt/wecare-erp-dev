import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PasswordHasher } from '../../domain/services/password-hasher';

/**
 * Concrete password hasher (adapter) — the only place that knows about bcrypt.
 * Swap this class to change the algorithm; no domain/application code changes.
 */
@Injectable()
export class BcryptPasswordHasher implements PasswordHasher {
  private readonly rounds = 10;

  hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, this.rounds);
  }

  compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
