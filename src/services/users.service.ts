import { HttpException } from '@/exceptions/httpException';
import { Service } from 'typedi';
import { CreateUserDto, UpdateUserDTO } from '@/dtos/users.dto';
import { PrismaBlaster, PrismaMantis } from '@/config/prisma';
import { hash } from 'bcrypt';
import { mantisGET } from '@/mantis/mantis.request';
import { UserMantis } from '@/interfaces/mantis.interface';
import { UserBlaster } from '@/interfaces/users.interface';

type FindUser = { id?: number; username?: string };

@Service()
export class UserService {
  public users = PrismaBlaster.user;
  public project_users_list = PrismaMantis.projetUserList;
  public projectInfo = PrismaBlaster.userProject;

  public async createUser({ username, password, token }: CreateUserDto) {
    const findUser = await this.users.findUnique({ where: { username } });
    if (findUser) throw new HttpException(409, 'Username already exists');

    const hashedPassword = await hash(password, 10);

    const user = await this.users.create({
      data: {
        username,
        token,
        password: hashedPassword,
      },
    });

    return user;
  }

  public async updateLastVersionCreated(projectId: number, userId: number, version: string) {
    const info = await this.projectInfo.upsert({
      update: {
        lastVersionCreated: version,
      },
      create: {
        project_id: projectId,
        lastVersionCreated: version,
        user_id: userId, // ici il s'agit bien de l'user ID de blast et non pas de mantis
      },
      where: {
        user_id_project_id: {
          project_id: projectId,
          user_id: userId,
        },
      },
    });
    return info;
  }

  public async findMyUserInfo(mantisToken: string) {
    const user = await mantisGET<UserMantis>('/users/me', mantisToken);

    return user;
  }

  public updateSocketId(userId: number, socketId: string) {
    return this.users.update({
      data: {
        socket_id: socketId,
      },
      where: {
        id: userId,
      },
    });
  }

  public findBlastUser({ id, username }: FindUser): Promise<UserBlaster> {
    if (id && id > 0) {
      return this.users.findUnique({ where: { id } });
    }

    if (username) {
      return this.users.findUnique({ where: { username } });
    }

    return null;
  }

  public async findUsersProject(project_id: number) {
    const rows = await this.project_users_list.findMany({
      where: {
        project_id,
        user: {
          enabled: {
            gt: 0,
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        user: {
          username: 'asc',
        },
      },
    });

    return rows.map(row => row.user);
  }

  public async findUserInfoByProject(user_id: number, project_id: number) {
    const info = await this.projectInfo.findUnique({
      where: {
        user_id_project_id: {
          user_id,
          project_id,
        },
      },
    });

    return info;
  }

  public async updateUser(id: number, dto: UpdateUserDTO): Promise<UserBlaster> {
    const user = await this.users.update({
      where: {
        id,
      },
      data: {
        theme: dto.theme,
      },
    });
    delete user.password;
    return user;
  }
}
