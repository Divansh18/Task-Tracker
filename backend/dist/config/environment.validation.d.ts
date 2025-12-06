declare enum NodeEnvironment {
    Development = "development",
    Production = "production",
    Test = "test"
}
declare class EnvironmentVariables {
    NODE_ENV?: NodeEnvironment;
    PORT?: number;
    DATABASE_HOST: string;
    DATABASE_PORT: number;
    DATABASE_USERNAME: string;
    DATABASE_PASSWORD: string;
    DATABASE_NAME: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_ACCESS_TOKEN_EXPIRES_IN: string;
    FRONTEND_ORIGIN?: string;
}
export declare function validate(config: Record<string, unknown>): EnvironmentVariables;
export {};
