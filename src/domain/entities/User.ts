import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export class User implements IUser {
  id: string;
  email: string;
  password_hash: string;
  name: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;

  private constructor(props: Omit<IUser, 'id' | 'created_at' | 'updated_at'> & { id?: string; created_at?: Date; updated_at?: Date }) {
    this.id = props.id || uuidv4();
    this.email = props.email;
    this.password_hash = props.password_hash;
    this.name = props.name;
    this.is_active = props.is_active !== undefined ? props.is_active : true;
    this.created_at = props.created_at || new Date();
    this.updated_at = props.updated_at || new Date();
  }

  static create(props: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): User {
    return new User(props);
  }

  static fromDatabase(props: IUser): User {
    return new User({
      ...props,
      created_at: new Date(props.created_at),
      updated_at: new Date(props.updated_at),
    });
  }

  update(props: Partial<Omit<IUser, 'id' | 'created_at'>>): void {
    if (props.email !== undefined) this.email = props.email;
    if (props.name !== undefined) this.name = props.name;
    if (props.is_active !== undefined) this.is_active = props.is_active;
    this.updated_at = new Date();
  }

  toPrimitive(): Omit<IUser, 'password_hash'> {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      is_active: this.is_active,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  }
}
