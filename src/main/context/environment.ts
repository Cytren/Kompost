
export default class Environment {
    environment: "development" | "staging" | "production";
    port: number;
    timezone: string;
    encryptionKey: string;
    mysql: {
        host: string;
        port: number;
        database: string;
        username: string;
        password: string;
    };
    jwt: {
        privateKey: string;
        maxRefreshTokens: number;
        tokenValidityHours: number;
    };
}
