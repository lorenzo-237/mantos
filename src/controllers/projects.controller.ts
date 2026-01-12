import { Container } from 'typedi';
import { NextFunction, Request, Response } from 'express';
import { ProjectParams, ProjectVersionParams, UserProjectParams } from '@/params/projects.param';
import { HttpException } from '@/exceptions/httpException';
import { NewProjectDto, NewVersionDto, UpdateVersionDto } from '@/dtos/projects.dto';
import { ProjectsService } from '@/services/projects.service';
import { RequestWithUser } from '@/interfaces/auth.interface';
import { UserService } from '@/services/users.service';
import { CategoryService } from '@/services/categories.service';
import { VersionService } from '@/services/versions.service';
import { ProjectVersionsQuery } from '@/queries/projects.query';

export class ProjectController {
  public project = Container.get(ProjectsService);
  public version = Container.get(VersionService);
  public user = Container.get(UserService);
  public categories = Container.get(CategoryService);

  public getProjects = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = await this.project.findAllProject(req.user.token);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getFilters = async (req: RequestWithUser, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { project_id } = req.params as unknown as ProjectParams;

      if (!project_id) {
        next(new HttpException(400, 'You must set <project_id>'));
        return;
      }

      const data = await this.project.findAllFilters(req.user.token, +project_id);

      res.status(200).json(data);
    } catch (error) {
      next(error);
    }
  };

  public getVersions = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { project_id } = req.params as unknown as ProjectParams;
      const { obsolete } = req.query as unknown as ProjectVersionsQuery;

      if (!project_id) {
        next(new HttpException(400, 'You must set <project_id>'));
        return;
      }

      const isObsolete = obsolete === 'all' ? undefined : obsolete === 'true' ? true : false;

      const versions = await this.version.findAllVersions(+project_id, isObsolete);

      res.status(200).json({
        count: versions.length,
        rows: versions,
      });
    } catch (error) {
      next(error);
    }
  };

  public createProjectVersion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { project_id } = req.params as unknown as ProjectParams;

    if (!project_id) {
      next(new HttpException(400, 'You must set <project_id>'));
      return;
    }

    const dto = req.body as NewVersionDto;

    try {
      const version = await this.version.createVersion(req.user.token, +project_id, dto);

      await this.user.updateLastVersionCreated(+project_id, req.user.id, dto.name);

      res.status(201).json(version);
    } catch (error) {
      next(error);
    }
  };

  public updateProjectVersion = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { project_id, version_id } = req.params as unknown as ProjectVersionParams;

    if (!project_id) {
      next(new HttpException(400, 'You must set <project_id>'));
      return;
    }

    if (!version_id) {
      next(new HttpException(400, 'You must set <version_id>'));
      return;
    }

    const dto = req.body as UpdateVersionDto;

    try {
      const response = await this.version.updateVersion(+project_id, +version_id, dto);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  public getProjectCategories = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { project_id } = req.params as unknown as ProjectParams;

      if (!project_id) {
        throw new HttpException(400, 'You must set <project_id>');
      }

      const categories = await this.categories.findAllCategories(+project_id);

      res.status(200).json(categories);
    } catch (error) {
      next(error);
    }
  };

  public getProjectUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { project_id } = req.params as unknown as ProjectParams;

      if (!project_id) {
        throw new HttpException(400, 'You must set <project_id>');
      }

      const users = await this.user.findUsersProject(+project_id);

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  public getUserProjectInfo = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { project_id, user_id } = req.params as unknown as UserProjectParams;

      if (!project_id) {
        throw new HttpException(400, 'You must set <project_id>');
      }

      if (!user_id) {
        throw new HttpException(400, 'You must set <user_id>');
      }

      const info = await this.user.findUserInfoByProject(+user_id, +project_id);

      res.status(200).json(info);
    } catch (error) {
      next(error);
    }
  };

  public createProject = async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as unknown as NewProjectDto;
      const project = await this.project.createNewProject({
        dto,
        isPublic: true,
        userId: req.user.mantis.user.id,
      });
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  };
}
