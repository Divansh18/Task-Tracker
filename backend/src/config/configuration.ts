export interface AppConfig {
  nodeEnv: string;
  port: number;
  frontendOrigin: string[];
  database: {
    host: string;
    port: number;
    username: string;
    password: string;
    name: string;
  };
  jwt: {
    accessTokenSecret: string;
    accessTokenExpiresIn: string;
  };
}

export default (): AppConfig => ({
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '4000', 10),
  frontendOrigin: process.env.FRONTEND_ORIGIN?.split(',').map((origin) =>
    origin.trim(),
  ) ?? ['http://localhost:3000'],
  database: {
    host: process.env.DATABASE_HOST ?? 'localhost',
    port: parseInt(process.env.DATABASE_PORT ?? '3306', 10),
    username: process.env.DATABASE_USERNAME ?? 'root',
    password: process.env.DATABASE_PASSWORD ?? '',
    name: process.env.DATABASE_NAME ?? 'task_tracker',
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET ?? 'change-me',
    accessTokenExpiresIn:
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '3600s',
  },
});
