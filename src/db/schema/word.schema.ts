import { Bibl } from "@/db/schema/bibl.schema";
import { Err } from "@/db/schema/err.schema";
import { TextSourceEnum } from "@/db/schema/etc.schema";
import { Sentence } from "@/db/schema/sentence.schema";
import { relations } from "drizzle-orm";
import { AnyPgColumn, index, pgTable, text } from "drizzle-orm/pg-core";

export const Word = pgTable(
    "Word",
    {
        id: text("id").primaryKey(),
        type: TextSourceEnum("type").notNull(),
        ana: text("ana").notNull(),
        lemma: text("lemma"),
        text: text("text").notNull(),

        prevContext: text("prevContext").references((): AnyPgColumn => Word.id),
        nextContext: text("nextContext").references((): AnyPgColumn => Word.id),

        biblId: text("biblId")
            .notNull()
            .references(() => Bibl.id),

        sentenceId: text("sentenceId")
            .notNull()
            .references(() => Sentence.id),
    },
    (word) => {
        return {
            lemmaIndex: index("word_" + word.lemma.name + "_idx").on(word.lemma),
            textIndex: index("word_" + word.text.name + "_idx").on(word.text),
            anaIndex: index("word_" + word.ana.name + "_idx").on(word.ana),
            typeIndex: index("word_" + word.type.name + "_idx").on(word.type),
            biblIdIndex: index("word_" + word.biblId.name + "_idx").on(word.biblId),
            sentenceIdIndex: index("word_" + word.sentenceId.name + "_idx").on(word.sentenceId),
            prevContextIndex: index("word_" + word.prevContext.name + "_idx").on(word.prevContext),
            nextContextIndex: index("word_" + word.nextContext.name + "_idx").on(word.nextContext),
            lemmaTypeTextIndex: index("word_lemma_type_text_idx").on(word.lemma, word.type, word.text),
            wordTypeLemmaIdIndex: index("word_type_lemma_id_idx").on(word.type, word.lemma, word.id),
            wordTypeLemmaIndex: index("word_type_lemma_idx").on(word.type, word.lemma),
        };
    },
);

export const WordRelations = relations(Word, ({ one, many }) => ({
    bibl: one(Bibl),
    sentence: one(Sentence, { fields: [Word.sentenceId], references: [Sentence.id] }),
    origErrors: many(Err, { relationName: "origWord" }),
    corrErrors: many(Err, { relationName: "corrWord" }),
    prevContext: one(Word, {
        fields: [Word.prevContext],
        references: [Word.id],
        relationName: "PrevWord",
    }),
    nextContext: one(Word, {
        fields: [Word.nextContext],
        references: [Word.id],
        relationName: "NextWord",
    }),
}));

export type WordInsert = typeof Word.$inferInsert;
export type WordSelect = typeof Word.$inferSelect;
