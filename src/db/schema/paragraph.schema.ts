import { Bibl } from "@/db/schema/bibl.schema";
import { Err } from "@/db/schema/err.schema";
import { TextSourceEnum } from "@/db/schema/etc.schema";
import { Sentence } from "@/db/schema/sentence.schema";
import { relations } from "drizzle-orm";
import { AnyPgColumn, index, pgTable, text } from "drizzle-orm/pg-core";

export const Paragraph = pgTable(
    "Paragraph",
    {
        id: text("id").primaryKey(),
        type: TextSourceEnum("type").notNull(),

        biblId: text("biblId")
            .notNull()
            .references(() => Bibl.id),

        origParagraphId: text("origParagraphId").references((): AnyPgColumn => Paragraph.id),
    },
    (paragraph) => {
        return {
            typeIndex: index("paragraph_" + paragraph.type.name + "_idx").on(paragraph.type),
            biblIdIndex: index("paragraph_" + paragraph.biblId.name + "_idx").on(paragraph.biblId),
            origParagraphIdIndex: index("paragraph_" + paragraph.origParagraphId.name + "_idx").on(
                paragraph.origParagraphId,
            ),
        };
    },
);

export const ParagraphRelations = relations(Paragraph, ({ one, many }) => ({
    bibl: one(Bibl, { fields: [Paragraph.biblId], references: [Bibl.id] }),
    origParagraph: one(Paragraph, {
        fields: [Paragraph.origParagraphId],
        references: [Paragraph.id],
        relationName: "OppositeParagraph",
    }),
    corrParagraph: one(Paragraph, {
        fields: [Paragraph.id],
        references: [Paragraph.origParagraphId],
        relationName: "OppositeParagraph",
    }),
    sentences: many(Sentence),
    origErrors: many(Err, { relationName: "origParagraph" }),
    corrErrors: many(Err, { relationName: "corrParagraph" }),
}));

export type ParagraphInsert = typeof Paragraph.$inferInsert;
