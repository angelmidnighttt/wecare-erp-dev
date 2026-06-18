import { User } from '../entities/user.entity';

export const USER_REPOSITORY = 'USER_REPOSITORY';

/**
 * Repository port (interface). Implemented in the infrastructure layer.
 */
export interface UserRepository {
  save(user: User): Promise<void>;
  findById(id: string): Promise<User | null>;
}
