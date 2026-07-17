import { AppSection } from './app.section.type';
import { CookieSection } from './cookie-config.section.type';
import { DatabaseSection } from './database-config.section.type';
import { JwtSection } from './jwt-config.section.type';
import { MailSection } from './mail-config.section.type';
import { SecuritySection } from './security-config.section.type';
import { UrlsSection } from './urls-config.section.type';

export type AppConfig = {
  readonly app: AppSection;
  readonly urls: UrlsSection;
  readonly database: DatabaseSection;
  readonly jwt: JwtSection;
  readonly cookie: CookieSection;
  readonly security: SecuritySection;
  readonly mail: MailSection;
};
