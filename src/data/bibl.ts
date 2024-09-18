import { dbClient } from "@/db/db";
import { Bibl } from "@/db/schema";
import { inArray } from "drizzle-orm/sql/expressions/conditions";

export const getBiblData = async (biblIds: string[]) => {
    return await dbClient.select().from(Bibl).where(inArray(Bibl.id, biblIds)).execute();
};
