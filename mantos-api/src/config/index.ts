import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';

if (process.env.ENV_PATH) {
  config({ path: process.env.ENV_PATH });
} else {
  try {
    config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });
  } catch (err) {
    console.error("Erreur lors du chargement des variables d'environnement:", err);
  }
}

export const CREDENTIALS = process.env.CREDENTIALS === 'true';
export const { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, SECRET_KEY, ADMIN_KEY, MANTIS_URL, MANTIS_API_URL, MD_TO_HTML_API_URL, EXTERNAL_AUTH_API_URL } = process.env;

export const { LDAP_USER, LDAP_PASSWORD, LDAP_SERVER, LDAP_PORT, LDAP_BASE } = process.env;

const { LOG_DIR } = process.env;

export const logDir = LOG_DIR;

if (!existsSync(logDir)) {
  mkdirSync(logDir);
}

export const APP = {
  IDENTITE: 'mantos-api',
};
