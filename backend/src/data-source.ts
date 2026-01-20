import "reflect-metadata";
import { DataSource } from "typeorm";
import { Company } from "./entities/Company";
import { Person } from "./entities/Person";
import { Opportunity } from "./entities/Opportunity";
import { Task } from "./entities/Task";
import { Note } from "./entities/Note";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: "database.sqlite",
    synchronize: true,
    logging: false,
    entities: [Company, Person, Opportunity, Task, Note],
    migrations: [],
    subscribers: [],
});
