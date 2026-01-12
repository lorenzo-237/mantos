import { ADMIN_KEY, SECRET_KEY } from '@/config';
import { LogInDto } from '@/dtos/auth.dto';
import { HttpException } from '@/exceptions/httpException';
import { DataStoredInToken, TokenData } from '@/interfaces/auth.interface';
import { compare } from 'bcrypt';
import Container, { Service } from 'typedi';
import { sign } from 'jsonwebtoken';
import { UserRequest, UserBlaster } from '@/interfaces/users.interface';
import { ExternalAuthClient } from '@/api/externalAuth.client';
import { UserService } from './users.service';
import { logger } from '@/utils/logger';

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
    const client = new ExternalAuthClient();

    // Étape 1: Authentification via l'API externe
    try {
      const externalToken = await client.authenticate(dto.username, dto.password);
      logger.info(`[AuthService] External authentication successful for user: ${dto.username}`);

      // Étape 2: Récupération du token Mantis
      const mantisToken = await client.getMantisToken(dto.username, externalToken);

      // Étape 3: Vérifier si l'utilisateur existe dans notre base Blaster
      let findUser = await this.userService.findBlastUser({ username: dto.username });

      if (!findUser) {
        if (mantisToken) {
          // L'utilisateur n'existe pas mais a un token Mantis, on le crée
          logger.info(`[AuthService] Creating new user ${dto.username} with Mantis token`);
          findUser = await this.userService.createUser({ username: dto.username, password: dto.password, token: mantisToken });
        } else {
          // L'utilisateur n'existe pas et n'a pas de token Mantis
          // Il faudra proposer sa création dans l'app
          logger.warn(`[AuthService] User ${dto.username} authenticated but has no Mantis token`);
          return { ldap: true };
        }
      } else {
        // L'utilisateur existe déjà dans notre base
        // On peut optionnellement mettre à jour le token Mantis s'il a changé
        if (mantisToken && findUser.token !== mantisToken) {
          logger.info(`[AuthService] Updating Mantis token for user ${dto.username}`);
          // Optionnel: mettre à jour le token dans la base
          // await this.userService.updateUserToken(findUser.id, mantisToken);
        }
      }

      // Étape 4: Générer notre propre JWT Mantos et connecter l'utilisateur
      return this._logUserIn(findUser);
    } catch (error) {
      logger.error(`[AuthService] External authentication failed for user ${dto.username}: ${error.message}`);
      throw error;
    }
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
