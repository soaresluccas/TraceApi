import type { IUserRepository } from '../../domain/interfaces';
import { User } from '../../domain/entities';
import { AuthService } from '../../infrastructure/services/AuthService';

export interface RegisterInput {
  email: string;
  password: string;
  name: string;
}

export interface RegisterOutput {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

export class RegisterUseCase {
  private authService: AuthService;

  constructor(private readonly userRepository: IUserRepository) {
    this.authService = new AuthService();
  }

  async execute(input: RegisterInput): Promise<RegisterOutput> {
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      throw new Error('Email já cadastrado');
    }

    const passwordHash = await this.authService.hashPassword(input.password);

    const user = User.create({
      email: input.email,
      password_hash: passwordHash,
      name: input.name,
      is_active: true,
    });

    const createdUser = await this.userRepository.create(user);

    const accessToken = this.authService.generateToken({
      userId: createdUser.id,
      email: createdUser.email,
    });

    return {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      accessToken,
    };
  }
}
