import { Bibl } from "@/db/schema/bibl.schema";
import { Err } from "@/db/schema/err.schema";
import { TextSourceEnum } from "@/db/schema/etc.schema";
import { Paragraph } from "@/db/schema/paragraph.schema";
import { Word } from "@/db/schema/word.schema";
import { relations } from "drizzle-orm";
import { index, pgTable, text } from "drizzle-orm/pg-core";

export const Sentence = pgTable(
    "Sentence",
    {
        id: text("id").primaryKey(),
        type: TextSourceEnum("type").notNull(),

        biblId: text("biblId")
            .notNull()
            .references(() => Bibl.id),
        paragraphId: text("paragraphId")
            .notNull()
            .references(() => Paragraph.id),
    },
    (sentence) => {
        return {
            typeIndex: index("sentence_" + sentence.type.name + "_idx").on(sentence.type),
            biblIdIndex: index("sentence_" + sentence.biblId.name + "_idx").on(sentence.biblId),
            paragraphIdIndex: index("sentence_" + sentence.paragraphId.name + "_idx").on(sentence.paragraphId),
        };
    },
);

export const SentenceRelations = relations(Sentence, ({ one, many }) => ({
    bibl: one(Bibl),
    paragraph: one(Paragraph, { fields: [Sentence.paragraphId], references: [Paragraph.id] }),
    origErrors: many(Err, { relationName: "origSentence" }),
    corrErrors: many(Err, { relationName: "corrSentence" }),
    words: many(Word),
}));

export type SentenceInsert = typeof Sentence.$inferInsert;
