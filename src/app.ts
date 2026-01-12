import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS, SECRET_KEY } from '@config';
import { Routes } from '@interfaces/routes.interface';
import { ErrorMiddleware } from '@middlewares/error.middleware';
import { logger, stream } from '@utils/logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { DataStoredInToken } from './interfaces/auth.interface';
import { verify } from 'jsonwebtoken';
import { UserController } from './controllers/users.controller';
import { AddVersionSocket, UpdateIssueSocket, UpdateVuesSocket } from './sockets';
// import ldapClient from '@ldap/ldapClient';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public http: any;
  public user = new UserController();
  public io: Server;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 3000;
    this.http = createServer(this.app);
    this.io = new Server(this.http);

    this.initializeMiddlewares();
    this.initializeRoutes(routes);
    this.initializeSwagger();
    this.initializeErrorHandling();
    this.initializeUploadsFolder();
    this.initializeSocket();
    // this.initializeLdapClient();
  }

  // pas besoin d'une connexion globale pour le moment
  // private initializeLdapClient() {
  //   ldapClient
  //     .authenticate()
  //     .then(() => {
  //       logger.info('👽 LDAP: Connected');
  //     })
  //     .catch(err => {
  //       logger.error(err);
  //     });
  // }

  private initializeSocket() {
    this.io.on('connection', async socket => {
      const token = socket.handshake.headers.access_token;
      let username = 'wrong token';
      try {
        const { id } = verify(token, SECRET_KEY) as DataStoredInToken;
        username = await this.user.setSocketId(id, socket.id);
        logger.info(`[socket] => ${username} (${socket.id})`);
      } catch (error) {
        logger.info(`[socket] => ${username} (${socket.id})`);
      }

      socket.on('update_issue', (data: UpdateIssueSocket) => {
        socket.broadcast.emit('update_issue', data);
      });
      socket.on('add_version', (data: AddVersionSocket) => {
        socket.broadcast.emit('add_version', data);
      });
      socket.on('update_vues', (data: UpdateVuesSocket) => {
        socket.broadcast.emit('update_vues', data);
      });

      socket.on('disconnect', () => {
        logger.info(`[socket] => ${username} (${socket.id}) closed`);
      });

      socket.on('error', err => {
        console.log(err);
      });
    });
  }

  private initializeUploadsFolder() {
    this.app.use(express.static('src/public'));
  }

  public listen() {
    this.http.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🔥 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  public getSocketInstance() {
    return this.io;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        info: {
          title: 'REST API',
          version: '1.0.0',
          description: 'Example docs',
        },
      },
      apis: ['swagger.yaml'],
    };

    const specs = swaggerJSDoc(options);
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
