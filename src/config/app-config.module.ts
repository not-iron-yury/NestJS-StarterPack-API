import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppConfigProvider } from './app-config.provider';
import appConfig from './app-config.registration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,

      load: [appConfig],
    }),
  ],

  providers: [AppConfigProvider],

  exports: [AppConfigProvider],
})
export class AppConfigModule {}
