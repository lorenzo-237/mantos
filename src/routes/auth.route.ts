import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthController } from '@/controllers/auth.controller';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { LogInDto } from '@/dtos/auth.dto';
import { AdminMiddleware } from '@/middlewares/admin.middleware';

export class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public auth = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/login`, ValidationMiddleware(LogInDto), this.auth.logIn);
    this.router.post(`${this.path}/admin/token`, ValidationMiddleware(LogInDto), this.auth.getAdminToken);
    this.router.get(`${this.path}/admin/test`, AdminMiddleware, this.auth.testAdminMiddleware);
  }
}
