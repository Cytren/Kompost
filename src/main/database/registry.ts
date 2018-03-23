
import Environment from "../context/environment";
import {ConnectionOptions, createConnection} from "typeorm";

export type Entity = Function;

export default async function setupDatabase (environment: Environment, entities: Entity[]) {
    const options: ConnectionOptions = {
        type: "mysql",
        host: environment.mysql.host,
        port: environment.mysql.port,
        username: environment.mysql.username,
        password: environment.mysql.password,
        database: environment.mysql.database,
        synchronize: true,
        logging: false,
        entities,
    };

    await createConnection(options);
}
