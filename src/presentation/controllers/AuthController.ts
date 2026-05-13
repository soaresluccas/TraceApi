import type { Request, Response } from 'express';
import type { IUserRepository } from '../../domain/interfaces';
import { RegisterUseCase, LoginUseCase } from '../../application/index';

export class AuthController {
  private registerUseCase: RegisterUseCase;
  private loginUseCase: LoginUseCase;

  constructor(userRepository: IUserRepository) {
    this.registerUseCase = new RegisterUseCase(userRepository);
    this.loginUseCase = new LoginUseCase(userRepository);
  }

  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        res.status(400).json({
          success: false,
          message: 'Email, senha e nome são obrigatórios',
        });
        return;
      }

      const result = await this.registerUseCase.execute({
        email,
        password,
        name,
      });

      res.status(201).json({
        success: true,
        message: 'Usuário registrado com sucesso',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao registrar usuário';
      res.status(400).json({
        success: false,
        message,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: 'Email e senha são obrigatórios',
        });
        return;
      }

      const result = await this.loginUseCase.execute({
        email,
        password,
      });

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: result,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      res.status(401).json({
        success: false,
        message,
      });
    }
  }
}
