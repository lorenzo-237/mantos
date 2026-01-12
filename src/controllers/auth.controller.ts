import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { AuthService } from '@services/auth.service';
import { LogInDto } from '@/dtos/auth.dto';
import { HttpException } from '@/exceptions/httpException';

export class AuthController {
  public auth = Container.get(AuthService);

  public logIn = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as LogInDto;

      if (dto.ldap) {
        const response = await this.auth.logInLdap(dto);

        if ('ldap' in response) {
          return res.status(200).json(response);
        } else {
          res.setHeader('Set-Cookie', [response.cookie]);
          res.status(200).json({ user: response.user, token: response.token });
        }
        return;
      }

      const { cookie, user, token } = await this.auth.logIn(dto);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ user, token });
    } catch (error) {
      next(error);
    }
  };

  public getAdminToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dto = req.body as LogInDto;

      if (!dto.ldap) {
        throw new HttpException(400, 'You must set <ldap>');
      }

      if (dto.username === 'wqt' && dto.password === 'animal-aquatique-nocturne') {
        const { token } = await this.auth.createAdminToken();
        res.status(200).json({ token });
        return;
      }

      throw new HttpException(400, 'Bad Credentials');
    } catch (error) {
      next(error);
    }
  };

  public testAdminMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ message: 'Le wqt est un animal aquatique nocturne' });
    } catch (error) {
      next(error);
    }
  };
}
