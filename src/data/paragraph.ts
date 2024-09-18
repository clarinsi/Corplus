import { dbClient } from "@/db/db";
import { BiblSelect, Err, ErrSelect, Paragraph, Sentence, Word } from "@/db/schema";
import { asc, eq, not } from "drizzle-orm";

export type ParagraphData = {
    id: string;
    type: "ORIG" | "CORR";
    biblId: string;
    origParagraphId: string | null;
    sentences: {
        id: string;
        type: "ORIG" | "CORR";
        biblId: string;
        paragraphId: string;
        words: { id: string; ana: string; lemma: string | null; text: string }[];
    }[];
    corrParagraph: {
        sentences: {
            id: string;
            type: "ORIG" | "CORR";
            biblId: string;
            paragraphId: string;
            words: { id: string; ana: string; lemma: string | null; text: string }[];
        }[];
    };
    bibl: BiblSelect;
    origErrors: ErrSelect[];
};

export const getParagraphData = async (paragraphId: string, keywordId?: string): Promise<ParagraphData | undefined> => {
    const paragraph = await dbClient.query.Paragraph.findFirst({
        where: eq(Paragraph.id, paragraphId),
        with: {
            bibl: true,
            sentences: {
                orderBy: asc(Sentence.id),
                with: {
                    words: {
                        orderBy: asc(Word.id),
                        columns: {
                            id: true,
                            text: true,
                            lemma: true,
                            ana: true,
                        },
                    },
                },
            },
            corrParagraph: {
                with: {
                    sentences: {
                        orderBy: asc(Sentence.id),
                        with: {
                            words: {
                                orderBy: asc(Word.id),
                                columns: {
                                    id: true,
                                    text: true,
                                    lemma: true,
                                    ana: true,
                                },
                            },
                        },
                    },
                },
            },
            origErrors: {
                where: not(eq(Err.type, "ID")),
            },
        },
    });

    if (!keywordId || !paragraph || paragraph.origErrors?.length > 0) return paragraph;

    // This is safe to do because there are no errors so there is no risk that corrected word ids changed
    const origKeywordId = keywordId.replace("t.", "s.");
    const corrKeywordId = keywordId.replace("s.", "t.");

    // Limit to offset sentences before and after the keyword sentence
    const offset = 2;
    const origSentenceKeywordIndex = paragraph.sentences.findIndex((s) => s.words.some((w) => w.id === origKeywordId));
    const origSentenceMin = Math.max(0, origSentenceKeywordIndex - offset);
    const origSentenceMax = Math.min(paragraph.sentences.length, origSentenceKeywordIndex + offset);
    const origSentences = paragraph.sentences.slice(origSentenceMin, origSentenceMax);

    const corrSentenceKeywordIndex = paragraph.corrParagraph.sentences.findIndex((s) =>
        s.words.some((w) => w.id === corrKeywordId),
    );
    const corrSentenceMin = Math.max(0, corrSentenceKeywordIndex - offset);
    const corrSentenceMax = Math.min(paragraph.corrParagraph.sentences.length, corrSentenceKeywordIndex + offset);
    const corrSentences = paragraph.corrParagraph.sentences.slice(corrSentenceMin, corrSentenceMax);

    paragraph.sentences = origSentences;
    paragraph.corrParagraph.sentences = corrSentences;

    return paragraph;
};
