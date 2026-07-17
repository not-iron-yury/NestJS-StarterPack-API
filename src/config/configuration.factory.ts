import { Env } from './env.schema';

import {
  AppConfig,
  AppSection,
  CookieSection,
  DatabaseSection,
  JwtSection,
  MailSection,
  SecuritySection,
  UrlsSection,
} from 'src/config/types';

export function createConfiguration(env: Env): AppConfig {
  const app = createAppSection(env);

  const jwt = createJwtSection(env);

  return {
    app,

    urls: createUrlsSection(env),

    database: createDatabaseSection(env),

    jwt,

    cookie: createCookieSection(env, jwt, app),

    security: createSecuritySection(env),

    mail: createMailSection(env),
  };
}

function createAppSection(env: Env): AppSection {
  return {
    name: env.APP_NAME,
    description: env.APP_DESCRIPTION,
    environment: env.NODE_ENV,
    port: env.PORT,
    apiPrefix: env.API_PREFIX,
  };
}

function createUrlsSection(env: Env): UrlsSection {
  return {
    api: env.APP_URL,
    frontend: env.FRONTEND_URL,
  };
}

function createDatabaseSection(env: Env): DatabaseSection {
  const url =
    `${env.DATABASE_TYPE}://${env.DATABASE_USER}:${env.DATABASE_PASSWORD}` +
    `@${env.DATABASE_HOST}:${env.DATABASE_PORT}` +
    `/${env.DATABASE_NAME}?schema=public`;

  return {
    type: env.DATABASE_TYPE,
    databaseName: env.DATABASE_NAME,

    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,

    username: env.DATABASE_USER,
    password: env.DATABASE_PASSWORD,

    url,
  };
}

function createJwtSection(env: Env): JwtSection {
  return {
    access: {
      secret: env.JWT_ACCESS_SECRET,
      expiresIn: env.JWT_ACCESS_EXPIRES_MINUTES * 60,
    },

    refresh: {
      secret: env.JWT_REFRESH_SECRET,
      expiresIn: env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60,
    },
  };
}

function createCookieSection(
  env: Env,
  jwt: JwtSection,
  app: AppSection,
): CookieSection {
  return {
    refresh: {
      name: env.REFRESH_COOKIE_NAME,

      httpOnly: true,

      secure: app.environment === 'production',

      sameSite: 'lax',

      maxAge: jwt.refresh.expiresIn * 1000,
    },
  };
}

function createSecuritySection(env: Env): SecuritySection {
  return {
    login: {
      maxAttempts: env.LOGIN_MAX_ATTEMPTS,

      windowMinutes: env.LOGIN_ATTEMPT_WINDOW_MINUTES,

      lockMinutes: env.LOCK_TIME_MINUTES,
    },

    throttle: {
      limit: env.THROTTLE_LIMIT,

      ttl: env.THROTTLE_TTL,
    },

    emailVerification: {
      ttlHours: env.EMAIL_VERIFICATION_TTL_HOURS,
    },

    passwordReset: {
      ttlHours: env.PASSWORD_RESET_TTL_HOURS,
    },
  };
}

function createMailSection(env: Env): MailSection {
  return {
    from: {
      address: env.MAIL_FROM,
      name: env.MAIL_FROM_NAME,
    },
  };
}
