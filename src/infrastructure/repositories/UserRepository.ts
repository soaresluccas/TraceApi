import type { IUserRepository } from '../../domain/interfaces';
import { User } from '../../domain/entities';
import { getSupabase } from '../config';

export class UserRepository implements IUserRepository {
  async create(user: User): Promise<User> {
    const supabase = getSupabase();
    const userData = user.toPrimitive();

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          id: user.id,
          email: user.email,
          password_hash: user.password_hash,
          name: user.name,
          is_active: user.is_active,
        },
      ])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }

    return User.fromDatabase(data);
  }

  async findById(id: string): Promise<User | null> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to find user: ${error.message}`);
    }

    return User.fromDatabase(data);
  }

  async findByEmail(email: string): Promise<User | null> {
    const supabase = getSupabase();

    console.log('[UserRepository] Buscando usuário com email:', email);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    console.log('[UserRepository] Resposta Supabase - Data:', data, 'Error:', error);

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('[UserRepository] Usuário não encontrado (PGRST116)');
        return null;
      }
      console.log('[UserRepository] Erro na query:', error.message);
      throw new Error(`Failed to find user: ${error.message}`);
    }

    console.log('[UserRepository] Usuário encontrado:', data);
    return User.fromDatabase(data);
  }

  async update(user: User): Promise<User> {
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from('users')
      .update({
        email: user.email,
        name: user.name,
        is_active: user.is_active,
        updated_at: user.updated_at,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return User.fromDatabase(data);
  }

  async delete(id: string): Promise<boolean> {
    const supabase = getSupabase();

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }

    return true;
  }
}
