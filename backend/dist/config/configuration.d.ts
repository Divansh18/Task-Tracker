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
declare const _default: () => AppConfig;
export default _default;
