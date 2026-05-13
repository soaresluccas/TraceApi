import type { IUserRepository } from '../../domain/interfaces';
import { AuthService } from '../../infrastructure/services/AuthService';

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginOutput {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

export class LoginUseCase {
  private authService: AuthService;

  constructor(private readonly userRepository: IUserRepository) {
    this.authService = new AuthService();
  }

  async execute(input: LoginInput): Promise<LoginOutput> {
    console.log('[LoginUseCase] Tentando login com email:', input.email);
    
    const user = await this.userRepository.findByEmail(input.email);
    console.log('[LoginUseCase] Usuário encontrado:', user ? 'Sim' : 'Não');

    if (!user) {
      console.log('[LoginUseCase] Erro: Usuário não encontrado');
      throw new Error('Email ou senha inválidos');
    }

    console.log('[LoginUseCase] Usuário ativo:', user.is_active);
    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    console.log('[LoginUseCase] Comparando senhas...');
    const passwordMatch = await this.authService.comparePassword(
      input.password,
      user.password_hash
    );
    console.log('[LoginUseCase] Senha válida:', passwordMatch);

    if (!passwordMatch) {
      console.log('[LoginUseCase] Erro: Senha inválida');
      throw new Error('Email ou senha inválidos');
    }

    const accessToken = this.authService.generateToken({
      userId: user.id,
      email: user.email,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      accessToken,
    };
  }
}
