import { EXTERNAL_AUTH_API_URL } from '@/config';
import { HttpException } from '@/exceptions/httpException';
import { logger } from '@/utils/logger';

/**
 * Interface pour la réponse de l'API externe d'authentification
 */
interface ExternalAuthResponse {
  token: string;
  [key: string]: any; // Permet d'autres propriétés optionnelles
}

/**
 * Interface pour la réponse du token Mantis
 */
interface MantisTokenResponse {
  token: string | null;
  [key: string]: any;
}

/**
 * Client pour communiquer avec l'API externe d'authentification
 * Cette API remplace l'ancien client LDAP direct
 */
export class ExternalAuthClient {
  private baseUrl: string;

  constructor() {
    if (!EXTERNAL_AUTH_API_URL) {
      throw new Error('EXTERNAL_AUTH_API_URL is not defined in environment variables');
    }
    this.baseUrl = EXTERNAL_AUTH_API_URL;
  }

  /**
   * Authentifie un utilisateur via l'API externe
   * @param uid Identifiant de l'utilisateur
   * @param password Mot de passe de l'utilisateur
   * @returns Le token JWT retourné par l'API externe
   * @throws HttpException si l'authentification échoue
   */
  public async authenticate(uid: string, password: string): Promise<string> {
    const requestUrl = `${this.baseUrl}/api/v1/auth/login`;

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid, password }),
    };

    try {
      logger.info(`[ExternalAuthClient] Authenticating user: ${uid}`);

      const response = await fetch(requestUrl, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        logger.error(`[ExternalAuthClient] Authentication failed for user ${uid}: ${response.status} ${errorText}`);
        throw new HttpException(response.status, `External authentication failed: ${errorText}`);
      }

      const data: ExternalAuthResponse = await response.json();

      if (!data.token) {
        logger.error(`[ExternalAuthClient] No token returned for user ${uid}`);
        throw new HttpException(500, 'External API did not return a token');
      }

      logger.info(`[ExternalAuthClient] User ${uid} authenticated successfully`);
      return data.token;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      logger.error(`[ExternalAuthClient] Network or parsing error: ${error.message}`);
      throw new HttpException(503, `Unable to reach external authentication service: ${error.message}`);
    }
  }

  /**
   * Récupère le token Mantis pour un utilisateur authentifié
   * @param uid Identifiant de l'utilisateur
   * @param externalToken Token JWT retourné par l'authentification externe
   * @returns Le token Mantis ou null si non disponible
   * @throws HttpException si la requête échoue
   */
  public async getMantisToken(uid: string, externalToken: string): Promise<string | null> {
    const requestUrl = `${this.baseUrl}/api/v1/mantis/token`;

    const requestOptions: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${externalToken}`,
      },
      body: JSON.stringify({ uid }),
    };

    try {
      logger.info(`[ExternalAuthClient] Fetching Mantis token for user: ${uid}`);

      const response = await fetch(requestUrl, requestOptions);

      if (!response.ok) {
        const errorText = await response.text();
        logger.warn(`[ExternalAuthClient] Mantis token fetch failed for user ${uid}: ${response.status} ${errorText}`);

        // Si le token n'existe pas, on retourne null au lieu de throw
        if (response.status === 404) {
          return null;
        }

        throw new HttpException(response.status, `Failed to fetch Mantis token: ${errorText}`);
      }

      const data: MantisTokenResponse = await response.json();

      logger.info(`[ExternalAuthClient] Mantis token ${data.token ? 'retrieved' : 'not found'} for user ${uid}`);
      return data.token;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      logger.error(`[ExternalAuthClient] Network error fetching Mantis token: ${error.message}`);
      throw new HttpException(503, `Unable to reach external API for Mantis token: ${error.message}`);
    }
  }
}
