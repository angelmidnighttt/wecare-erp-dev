import { Email } from '../value-objects/email.vo';

/**
 * User aggregate root (pure domain model — no framework / ORM concerns).
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: Email,
    private readonly passwordHash: string,
  ) {}

  static register(id: string, email: string, passwordHash: string): User {
    return new User(id, Email.create(email), passwordHash);
  }

  getPasswordHash(): string {
    return this.passwordHash;
  }
}
