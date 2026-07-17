import { Env } from 'src/config/env.schema';

export type AppSection = {
  readonly name: string;
  readonly description: string;
  readonly environment: Env['NODE_ENV'];
  readonly port: number;
  readonly apiPrefix: string;
};
