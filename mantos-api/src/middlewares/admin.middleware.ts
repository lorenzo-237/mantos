import { ADMIN_KEY } from '@/config';
import { PrismaBlaster } from '@/config/prisma';
import { HttpException } from '@/exceptions/httpException';
import { NextFunction, Response, Request } from 'express';
import { verify } from 'jsonwebtoken';

const getAuthorization = req => {
  const coockie = req.cookies['Authorization'];
  if (coockie) return coockie;

  const header = req.header('Authorization');
  if (header) return header.split('Bearer ')[1];

  return null;
};

export const AdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const Authorization = getAuthorization(req);

    if (!Authorization) {
      next(new HttpException(404, 'Admin authentication token missing'));
      return;
    }

    (await verify(Authorization, ADMIN_KEY)) as { id: string };

    const tokens = PrismaBlaster.adminToken;

    const findToken = await tokens.findFirst({
      where: { data: Authorization },
    });

    if (!findToken) {
      next(new HttpException(401, 'Wrong admin authentication token (1)'));
      return;
    }

    next();
  } catch (error) {
    next(new HttpException(401, 'Wrong admin authentication token (2)'));
  }
};
