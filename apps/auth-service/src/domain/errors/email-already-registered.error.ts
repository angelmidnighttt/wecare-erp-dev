/**
 * Raised when someone tries to register with an email that already exists.
 * A domain rule — independent of transport (Redis/HTTP) and storage.
 */
export class EmailAlreadyRegisteredError extends Error {
  constructor(email: string) {
    super(`Email already registered: ${email}`);
    this.name = 'EmailAlreadyRegisteredError';
  }
}
