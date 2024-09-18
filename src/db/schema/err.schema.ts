import { Paragraph } from "@/db/schema/paragraph.schema";
import { Sentence } from "@/db/schema/sentence.schema";
import { Word } from "@/db/schema/word.schema";
import { relations } from "drizzle-orm";
import { index, pgTable, serial, text } from "drizzle-orm/pg-core";

export const Err = pgTable(
    "Err",
    {
        id: serial("id").primaryKey(),
        type: text("type").notNull(),

        origWordId: text("origWordId").references(() => Word.id),
        corrWordId: text("corrWordId").references(() => Word.id),

        origSentenceId: text("origSentenceId").references(() => Sentence.id),
        corrSentenceId: text("corrSentenceId").references(() => Sentence.id),

        origParagraphId: text("origParagraphId").references(() => Paragraph.id),
        corrParagraphId: text("corrParagraphId").references(() => Paragraph.id),

        groupId: text("groupId").notNull(),
    },
    (err) => {
        return {
            typeIndex: index("err_" + err.type.name + "_idx").on(err.type),
            origWordIdIndex: index("err_" + err.origWordId.name + "_idx").on(err.origWordId),
            corrWordIdIndex: index("err_" + err.corrWordId.name + "_idx").on(err.corrWordId),
            origSentenceIdIndex: index("err_" + err.origSentenceId.name + "_idx").on(err.origSentenceId),
            corrSentenceIdIndex: index("err_" + err.corrSentenceId.name + "_idx").on(err.corrSentenceId),
            origParagraphIdIndex: index("err_" + err.origParagraphId.name + "_idx").on(err.origParagraphId),
            corrParagraphIdIndex: index("err_" + err.corrParagraphId.name + "_idx").on(err.corrParagraphId),
            errTypeOrigWordIdIndex: index("err_type_origWordId_idx").on(err.type, err.origWordId),
            errTypeCorrWordIdIndex: index("err_type_corrWordId_idx").on(err.type, err.corrWordId),
        };
    },
);

export const ErrRelations = relations(Err, ({ one }) => ({
    origWord: one(Word, { fields: [Err.origWordId], references: [Word.id], relationName: "origWord" }),
    corrWord: one(Word, { fields: [Err.corrWordId], references: [Word.id], relationName: "corrWord" }),
    origSentence: one(Sentence, {
        fields: [Err.origSentenceId],
        references: [Sentence.id],
        relationName: "origSentence",
    }),
    corrSentence: one(Sentence, {
        fields: [Err.corrSentenceId],
        references: [Sentence.id],
        relationName: "corrSentence",
    }),
    origParagraph: one(Paragraph, {
        fields: [Err.origParagraphId],
        references: [Paragraph.id],
        relationName: "origParagraph",
    }),
    corrParagraph: one(Paragraph, {
        fields: [Err.corrParagraphId],
        references: [Paragraph.id],
        relationName: "corrParagraph",
    }),
}));

export type ErrInsert = typeof Err.$inferInsert;
export type ErrSelect = typeof Err.$inferSelect;
