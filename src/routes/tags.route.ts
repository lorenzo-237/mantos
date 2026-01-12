import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { TagController } from '@/controllers/tags.controller';

export class TagRoute implements Routes {
  public path = '/tags';
  public router = Router();
  public tag = new TagController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.tag.getTags);
  }
}
