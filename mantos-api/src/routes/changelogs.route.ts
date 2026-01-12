import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { ChangelogController } from '@/controllers/changelogs.controller';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class ChangelogRoute implements Routes {
  public path = '/changelogs';
  public router = Router();
  public changelog = new ChangelogController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, AuthMiddleware, this.changelog.getMarkdownChangelogs);
    this.router.post(`${this.path}/html`, AuthMiddleware, this.changelog.getHtmlChangelog);
  }
}
