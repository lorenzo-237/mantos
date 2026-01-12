import { Request } from 'express';
import { UserRequest } from './users.interface';

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface DataStoredInToken {
  id: number;
}

export interface RequestWithUser extends Request {
  user: UserRequest;
}
