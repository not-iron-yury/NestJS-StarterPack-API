export type DatabaseSection = {
  readonly type: DatabaseType;
  readonly host: string;
  readonly port: number;
  readonly username: string;
  readonly password: string;
  readonly databaseName: string;
  readonly url: string; // Url вычисляется на основе всех выше перечисленных полей. Но он относится к БД.
};

type DatabaseType = 'postgresql';
