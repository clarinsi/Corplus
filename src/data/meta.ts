import { dbClient } from "@/db/db";
import { Bibl, CountMeta, Err, Paragraph, Sentence } from "@/db/schema";
import { TextSource } from "@/db/schema/etc.schema";
import { Word } from "@/db/schema/word.schema";
import { and, count, countDistinct, eq, not } from "drizzle-orm";

export const getCorpusSize = async (searchSource: TextSource, withErrors: boolean): Promise<number> => {
    let dataColumn: "origCounts" | "origWithErrCounts" | "corrCounts" | "corrWithErrCounts";
    if (searchSource === "ORIG") {
        dataColumn = withErrors ? "origWithErrCounts" : "origCounts";
    } else {
        dataColumn = withErrors ? "corrWithErrCounts" : "corrCounts";
    }

    const result = await dbClient
        .select({
            counts: CountMeta[dataColumn],
        })
        .from(CountMeta)
        .where(eq(CountMeta.name, "corpusSize"));

    return Number(result.at(0)?.counts ?? -1);
};

export const getStats = async () => {
    const wordCount = await getWordCount();
    const sentenceCount = await getSentenceCount();
    const paragraphCount = await getParagraphCount();
    const correctedParagraphCount = await getCorrectedParagraphCount();

    return {
        wordCount,
        sentenceCount,
        paragraphCount,
        correctedParagraphCount,
    };
};

const getWordCount = async () => {
    const result = await dbClient.select({ count: count() }).from(Word).where(eq(Word.type, "ORIG"));
    return result.at(0)?.count ?? -1;
};

const getSentenceCount = async () => {
    const result = await dbClient.select({ count: count() }).from(Sentence).where(eq(Sentence.type, "ORIG"));
    return result.at(0)?.count ?? -1;
};

const getParagraphCount = async () => {
    // Note: not actually paragraphs but "texts"
    const result = await dbClient.select({ count: count() }).from(Bibl);
    return result.at(0)?.count ?? -1;
};

const getCorrectedParagraphCount = async () => {
    // Note: not actually paragraphs but "texts"
    const result = await dbClient
        .select({ count: countDistinct(Bibl.id) })
        .from(Bibl)
        .innerJoin(Paragraph, eq(Bibl.id, Paragraph.biblId))
        .innerJoin(Err, eq(Paragraph.id, Err.corrParagraphId))
        .where(and(eq(Paragraph.type, "CORR"), not(eq(Err.type, "ID"))));
    return result.at(0)?.count ?? -1;
};
