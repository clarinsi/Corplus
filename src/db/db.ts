import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema/index";

// Note: This should only be used when needing to manually disconnect from the database.
export const queryClient = postgres(process.env.KOST_DATABASE_URL!);

export const dbClient = drizzle(queryClient, { schema });
