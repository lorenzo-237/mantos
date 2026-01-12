import * as ldap from 'ldapjs';
import { LDAP_BASE, LDAP_PASSWORD, LDAP_PORT, LDAP_SERVER, LDAP_USER } from '../config';
import { logger } from '@/utils/logger';

// const tlsOptions = { rejectUnauthorized: false }; // ??

export class LdapClient {
  client: any;
  uid: string;
  password: string;

  constructor(uid: string, password: string) {
    this.client = ldap.createClient({
      url: `ldap://${LDAP_SERVER}:${LDAP_PORT}`,
    });

    this.uid = uid;
    this.password = password;
  }

  private initialize(id: string) {
    // this.client.on('end', () => {
    //   logger.info(`[ldap:${id}] [end]`);
    // });
    this.client.on('close', () => {
      logger.info(`[ldap:${id}] [close]`);
    });
    this.client.on('destroy', err => {
      logger.info(`[ldap:${id}] [destroy] =>` + err);
    });
  }

  public async authenticate() {
    return new Promise((resolve, reject) => {
      //'uid=lmagni,' + LDAP_BASE, 'lmagni'
      this.client.bind(this.uid, this.password, error => {
        if (error) {
          reject(error);
        } else {
          this.initialize('global');

          resolve(this.client);
        }
      });
    });
  }

  public async GetMantisToken(): Promise<{ token: string | null }> {
    return new Promise((resolve, reject) => {
      const dn = `uid=${this.uid},${LDAP_BASE}`;

      const opts = {
        scope: 'sub',
        attributes: ['description'],
      };

      this.client.bind(dn, this.password, error => {
        if (error) {
          reject(error);
        } else {
          this.initialize(this.uid);

          const mantis = {
            token: null,
          };

          this.client.search(dn, opts, (err, res) => {
            // res.on('searchRequest', searchRequest => {
            //   console.log('searchRequest: ', searchRequest.messageId);
            // });
            res.on('searchEntry', entry => {
              // console.log(entry.pojo);
              if (entry.pojo.attributes.length > 0) {
                mantis.token = entry.pojo.attributes[0].values[0];
              }
            });
            // res.on('searchReference', referral => {
            //   console.log('referral: ' + referral.uris.join());
            // });
            res.on('error', err => {
              logger.error('error: ' + err.message);
              reject(err);
            });
            res.on('end', () => {
              // console.log('status: ' + result.status);
              this.client.unbind(err => {
                if (err) {
                  logger.error('LDAP [unbind] :', err);
                }
              });

              resolve(mantis);
            });
          });
        }
      });
    });
  }
}

export default new LdapClient(LDAP_USER, LDAP_PASSWORD);
