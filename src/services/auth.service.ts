import { ADMIN_KEY, SECRET_KEY } from '@/config';
import { LogInDto } from '@/dtos/auth.dto';
import { HttpException } from '@/exceptions/httpException';
import { DataStoredInToken, TokenData } from '@/interfaces/auth.interface';
import { compare } from 'bcrypt';
import Container, { Service } from 'typedi';
import { sign } from 'jsonwebtoken';
import { UserRequest, UserBlaster } from '@/interfaces/users.interface';
import { LdapClient } from '@/ldap/ldapClient';
import { UserService } from './users.service';

type ResponseLogInLdap = { cookie: string; user: UserRequest; token: string } | { ldap: true };
@Service()
export class AuthService {
  public userService = Container.get(UserService);

  public async logIn(dto: LogInDto) {
    const findUser = await this.userService.findBlastUser({ username: dto.username });

    if (!findUser) throw new HttpException(404, `User not found`);

    const match = await compare(dto.password, findUser.password);

    if (!match) {
      throw new HttpException(403, 'Invalid credentials');
    }

    return this._logUserIn(findUser);
  }

  public async logInLdap(dto: LogInDto): Promise<ResponseLogInLdap> {
    const client = new LdapClient(dto.username, dto.password);

    const mantis = await client.GetMantisToken(); // la fonction va throw une exception en cas d'erreur gérée dans le controller

    let findUser = await this.userService.findBlastUser({ username: dto.username });

    if (!findUser) {
      if (mantis.token) {
        // sur le ldap il y a pas de mantis token donc je vais créer l'user
        findUser = await this.userService.createUser({ username: dto.username, password: dto.password, token: mantis.token });
      } else {
        // il faudra proposer sa création dans l'app car le token n'existe nulle part
        return { ldap: true };
      }
    } else {
      // l'utilisateur existe donc je pars du principe qu'il a un token
      if (!mantis.token) {
        // je pourrais créer le token dans le ldap, mais pour l'instant je ne vais pas le faire
      }
    }

    return this._logUserIn(findUser);
  }

  private async _logUserIn(findUser: UserBlaster): Promise<{ cookie: string; user: UserRequest; token: string }> {
    const data = this.createToken(findUser.id);
    const cookie = this.createCookie(data);
    const token = data.token;

    const userMantis = await this.userService.findMyUserInfo(findUser.token);

    const user: UserRequest = {
      id: findUser.id,
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

    return { cookie, user, token };
  }

  public createToken(userId: number): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: userId };
    const secretKey: string = SECRET_KEY;
    const expiresIn: number = 7 * 24 * 60 * 60; // 1day

    return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
  }

  public createAdminToken(): TokenData {
    const dataStoredInToken: DataStoredInToken = { id: 0 };
    const secretKey: string = ADMIN_KEY;
    return { expiresIn: 0, token: sign(dataStoredInToken, secretKey) };
  }

  public createCookie(tokenData: TokenData): string {
    return `Authorization=${tokenData.token}; HttpOnly; Max-Age=${tokenData.expiresIn};`;
  }
}
