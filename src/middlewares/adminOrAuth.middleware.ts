import { ADMIN_KEY, SECRET_KEY } from '@/config';
import { HttpException } from '@/exceptions/httpException';
import { DataStoredInToken, RequestWithUser } from '@/interfaces/auth.interface';
import PrismaBlaster from '@/prisma/blaster-cli';
import { UserService } from '@/services/users.service';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import Container from 'typedi';

const getAuthorization = req => {
  const cookie = req.cookies['Authorization'];
  if (cookie) return cookie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

async function verifyAuthorization(token: string) {
  try {
    const { id } = (await verify(token, SECRET_KEY)) as DataStoredInToken;
    return id;
  } catch (error) {
    // ne rien faire, je test le token admin
  }

  try {
    const { id } = (await verify(token, ADMIN_KEY)) as DataStoredInToken;
    return id;
  } catch (error) {
    throw error;
  }
}

export const AdminOrAuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);
    const userService = Container.get(UserService);

    if (!Authorization) {
      next(new HttpException(404, 'Authentication token missing'));
      return;
    }

    const id = await verifyAuthorization(Authorization);

    if (id > 0) {
      // user authenticated
      const findUser = await userService.findBlastUser({ id });

      if (!findUser) {
        next(new HttpException(401, 'Wrong authentication token (11)'));
        return;
      }

      const userMantis = await userService.findMyUserInfo(findUser.token);

      req.user = {
        id,
        username: findUser.username,
        token: findUser.token,
        theme: findUser.theme,
        isAdmin: findUser.isAdmin,
        mantis: {
          user: {
            id: userMantis.id,
            name: userMantis.name,
          },
        },
      };
    } else {
      // admin token
      const tokens = PrismaBlaster.adminToken;

      const findToken = await tokens.findFirst({
        where: { data: Authorization },
      });

      if (!findToken) {
        next(new HttpException(401, 'Wrong admin authentication token (11)'));
        return;
      }
    }

    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token (22)'));
  }
};
