import { registerAs } from '@nestjs/config';

import { createConfiguration } from './configuration.factory';
import { envSchema } from './env.schema';

export default registerAs('app', () => {
  const env = envSchema.parse(process.env);

  return createConfiguration(env);
});

/**
 * registerAs('app', callback) делает следующее:
 *
 * Регистрирует именованный конфиг app и выполняет callback.
 * Результат кладет внутрь ConfigService.
 *
 *
 * То есть позже можно получить configService.get('app') и получить нужный нам AppConfig
 */
