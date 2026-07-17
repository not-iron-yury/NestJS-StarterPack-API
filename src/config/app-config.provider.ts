import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import {
  AppSection,
  CookieSection,
  DatabaseSection,
  JwtSection,
  MailSection,
  SecuritySection,
  UrlsSection,
} from 'src/config/types';
import type { AppConfig } from './types/app-config.type';

@Injectable()
export class AppConfigProvider implements AppConfig {
  readonly app: AppSection;
  readonly urls: UrlsSection;
  readonly database: DatabaseSection;
  readonly jwt: JwtSection;
  readonly cookie: CookieSection;
  readonly security: SecuritySection;
  readonly mail: MailSection;

  constructor(configService: ConfigService) {
    const config = configService.getOrThrow<AppConfig>('app');

    this.app = config.app;

    this.urls = config.urls;

    this.database = config.database;

    this.jwt = config.jwt;

    this.cookie = config.cookie;

    this.security = config.security;

    this.mail = config.mail;
  }
}
