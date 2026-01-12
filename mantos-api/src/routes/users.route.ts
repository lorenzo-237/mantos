import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { CreateUserDto, UpdateUserDTO, VerifyTokenDto } from '@/dtos/users.dto';
import { UserController } from '@/controllers/users.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class UserRoute implements Routes {
  public path = '/users';
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/me`, AuthMiddleware, this.user.getMyUserInfo);
    this.router.post(`${this.path}/verify`, ValidationMiddleware(VerifyTokenDto), this.user.verifyToken);
    this.router.post(`${this.path}`, AuthMiddleware, ValidationMiddleware(CreateUserDto), this.user.newUser);
    this.router.patch(`${this.path}`, AuthMiddleware, ValidationMiddleware(UpdateUserDTO), this.user.updateUser);
  }
}
