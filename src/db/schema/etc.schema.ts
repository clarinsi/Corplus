import { pgEnum, pgTable, serial, text } from "drizzle-orm/pg-core";

export const TextSourceEnum = pgEnum("TextSource", ["ORIG", "CORR"]);
export type TextSource = (typeof TextSourceEnum.enumValues)[number];

export const CountMeta = pgTable("CountMeta", {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    origCounts: text("origCounts").notNull(),
    origWithErrCounts: text("origWithErrCounts"),
    corrCounts: text("corrCounts").notNull(),
    corrWithErrCounts: text("corrWithErrCounts"),
});
