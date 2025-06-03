import "reflect-metadata";
import { DataSource } from "typeorm";

import * as dotenv from "dotenv";
import { User } from "./entity/User";
import { Product } from "./entity/Product";
import { Order } from "./entity/Order";
import { OrderItem } from "./entity/OrderItem";

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV } =
  process.env;

const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: parseInt(DB_PORT || "5432"),
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,

  synchronize: NODE_ENV === "dev" ? false : false,
//logging logs sql command on the treminal
  logging: NODE_ENV === "dev" ? false : false,
  entities: [User, Product, Order, OrderItem],
  migrations: [__dirname + "/migration/*.ts"],
  subscribers: [],
});

async function connectWithRetry(retries = MAX_RETRIES): Promise<void> {
  while (retries > 0) {
    try {
      await AppDataSource.initialize();
      console.log("DB connection successful");
      return;
    } catch (error) {
      console.error(`DB connection failed. Retries left: ${retries - 1}`, error.message);
      retries--;
      if (retries === 0) {
        console.error("Max retries reached. Exiting.");
        throw error;
      }
      await new Promise((res) => setTimeout(res, RETRY_DELAY_MS));
    }
  }
}


export { AppDataSource, connectWithRetry };