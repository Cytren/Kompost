
import Environment from "../context/environment";
import {ConnectionOptions, createConnection} from "typeorm";
import Model from "./model";

export default async function setupDatabase (environment: Environment, models: (new () => Model)[]) {
    const options: ConnectionOptions = {
        type: "mysql",
        host: environment.mysql.host,
        port: environment.mysql.port,
        username: environment.mysql.username,
        password: environment.mysql.password,
        database: environment.mysql.database,
        synchronize: true,
        logging: false,
        entities: models,
    };

    await createConnection(options);
}
