import { NewProjectDto } from '@/dtos/projects.dto';
import { Filter } from '@/interfaces/filters.interface';
import { FilterMantis, ProjectMantis } from '@/interfaces/mantis.interface';
import { Project } from '@/interfaces/projects.interface';
import { mantisGET } from '@/mantis/mantis.request';

import { Service } from 'typedi';
import { ProjectMantisTable } from '../../prisma/generated/mantis-cli';
import PrismaMantis from '@/prisma/mantis-cli';
import { HttpException } from '@/exceptions/httpException';

const STATUS_DEVELOPPEMENT = 10;
// const STATUS_LIVRE = 30;
const VIEW_PUBLIC = 10;
const VIEW_PRIVATE = 50;
const LEVEL_GESTIONNAIRE = 70;

@Service()
export class ProjectsService {
  public prisma = PrismaMantis;

  public async findAllProject(mantisToken: string): Promise<Project[]> {
    const data = await mantisGET<{ projects: ProjectMantis[] }>('/projects', mantisToken);

    return data.projects
      .filter(project => project.enabled)
      .map(project => {
        const myProject: Project = {
          id: project.id,
          name: project.name,
          description: project.description,
        };
        return myProject;
      });
  }

  public async findAllFilters(mantisToken: string, project_id: number | null): Promise<Filter[]> {
    const data = await mantisGET<{ filters: FilterMantis[] }>('/filters', mantisToken);

    return data.filters
      .filter(filter => {
        if (!project_id) return true;
        return filter.project.id === project_id;
      })
      .map(filter => {
        const myFilter: Filter = {
          id: filter.id,
          name: filter.name,
          project: filter.project.name,
        };
        return myFilter;
      });
  }

  public async saveUserToProject(projectId: number, userId: number, accessLevel: number) {
    return this.prisma.projetUserList.upsert({
      where: {
        project_id_user_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
      create: {
        project_id: projectId,
        user_id: userId,
        access_level: accessLevel,
      },
      update: {
        access_level: accessLevel,
      },
    });
  }

  public async createNewProject({ dto, isPublic, userId }: { dto: NewProjectDto; isPublic: boolean; userId: number }): Promise<ProjectMantisTable> {
    const findProject = await this.prisma.projectMantisTable.findUnique({
      where: {
        name: dto.name,
      },
    });

    if (findProject) {
      throw new HttpException(409, 'Le projet existe déjà');
    }

    const project = await this.prisma.$transaction(async tx => {
      const project = await tx.projectMantisTable.upsert({
        where: {
          name: dto.name,
        },
        create: {
          name: dto.name,
          description: dto.description,
          access_min: 10,
          category_id: 1,
          enabled: 1,
          inherit_global: 1,
          status: STATUS_DEVELOPPEMENT,
          view_state: isPublic ? VIEW_PUBLIC : VIEW_PRIVATE,
          file_path: '',
        },
        update: {
          description: dto.description,
        },
      });

      // ajout de l'utilisateur au projet
      const project_id = project.id;
      const access_level = LEVEL_GESTIONNAIRE;
      await tx.projetUserList.upsert({
        where: {
          project_id_user_id: {
            project_id,
            user_id: userId,
          },
        },
        create: {
          project_id,
          user_id: userId,
          access_level,
        },
        update: {
          access_level,
        },
      });

      return project;
    });
    return project;
  }
}
