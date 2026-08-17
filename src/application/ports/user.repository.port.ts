import type { User } from '../../domain/entities/user.entity.js';

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
}

export interface UserRepositoryPort {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  count(): Promise<number>;
}
