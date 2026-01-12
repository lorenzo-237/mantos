import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AssemblyController } from '@/controllers/assembly_info.controller';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';
import { NewAssemblyInfoDto } from '@/dtos/assembly_info.dto';
import { AdminMiddleware } from '@/middlewares/admin.middleware';
import { AdminOrAuthMiddleware } from '@/middlewares/adminOrAuth.middleware';

export class AssemblyRoute implements Routes {
  public path = '/assembly';
  public router = Router();
  public assembly = new AssemblyController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AdminOrAuthMiddleware, this.assembly.getAssemblyInfo);
    this.router.get(`${this.path}/versions`, AdminOrAuthMiddleware, this.assembly.getVersionsAvailable);
    this.router.post(`${this.path}`, AdminMiddleware, ValidationMiddleware(NewAssemblyInfoDto), this.assembly.createAssembly);
  }
}
