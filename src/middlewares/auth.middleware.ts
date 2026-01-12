import { SECRET_KEY } from '@/config';
import { HttpException } from '@/exceptions/httpException';
import { DataStoredInToken, RequestWithUser } from '@/interfaces/auth.interface';
import { UserService } from '@/services/users.service';
import { NextFunction, Response } from 'express';
import { verify } from 'jsonwebtoken';
import Container from 'typedi';

const getAuthorization = req => {
  const coockie = req.cookies['Authorization'];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const AuthMiddleware = async (req: RequestWithUser, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);
    const userService = Container.get(UserService);

    if (!Authorization) {
      next(new HttpException(404, 'Authentication token missing'));
      return;
    }

    const { id } = (await verify(Authorization, SECRET_KEY)) as DataStoredInToken;

    const findUser = await userService.findBlastUser({ id });

    if (!findUser) {
      next(new HttpException(401, 'Wrong authentication token (1)'));
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

    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong authentication token (2)'));
  }
};
