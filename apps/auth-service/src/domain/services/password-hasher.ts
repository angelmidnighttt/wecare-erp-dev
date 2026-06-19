export const PASSWORD_HASHER = 'PASSWORD_HASHER';

/**
 * Password hasher port. The domain declares WHAT it needs (hash / compare);
 * the concrete algorithm (bcrypt, argon2, …) lives in the infrastructure layer.
 */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  compare(plain: string, hash: string): Promise<boolean>;
}
