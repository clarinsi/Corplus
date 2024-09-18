import { dbClient } from "@/db/db";
import { Sentence, Word } from "@/db/schema";
import { punctuationRegex } from "@/util/util";
import { asc, eq } from "drizzle-orm";
import { inArray } from "drizzle-orm/sql/expressions/conditions";

export interface TrimmedSentence {
    id: string;
    words: string;
}

export interface SentenceContext {
    preceeding: TrimmedSentence | undefined;
    following: TrimmedSentence | undefined;
}

const mapWordToString = (word: { text: string }) => {
    return (punctuationRegex.test(word.text) ? "" : " ") + word.text;
};

const transformRawData = (raw: { id: string; word: { text: string } }[]) => {
    const transformed = raw.reduce(
        (acc, { id, word }) => {
            let sentence = acc[id];
            if (!sentence) {
                sentence = {
                    id,
                    words: [],
                };
                acc[id] = sentence;
            }
            sentence.words.push(word);
            return acc;
        },
        {} as Record<string, { id: string; words: { text: string }[] }>,
    );

    return Object.values(transformed);
};

export const getSentencesContext = async (sentenceIds: string[]): Promise<Record<string, SentenceContext>> => {
    const mappedIds = sentenceIds.map((sentenceId) => {
        const paragraphId = sentenceId.slice(0, -3);
        const sentenceNumber = Number(sentenceId.slice(-3));
        const preceedingId = paragraphId + (sentenceNumber - 1).toString().padStart(3, "0");
        const followingId = paragraphId + (sentenceNumber + 1).toString().padStart(3, "0");
        return { sentenceId, preceedingId, followingId };
    });

    const raw = await dbClient
        .select({
            id: Sentence.id,
            word: {
                text: Word.text,
            },
        })
        .from(Sentence)
        .innerJoin(Word, eq(Word.sentenceId, Sentence.id))
        .where(
            inArray(
                Sentence.id,
                mappedIds.flatMap((s) => [s.preceedingId, s.followingId]),
            ),
        )
        .orderBy(asc(Word.id));

    const sentences = transformRawData(raw);

    // Process the sentences to reduce the amount of data sent to the client
    return mappedIds.reduce(
        (acc, { sentenceId, preceedingId, followingId }) => {
            const preceeding = sentences.find((s) => s.id === preceedingId);
            const following = sentences.find((s) => s.id === followingId);

            acc[sentenceId] = {
                preceeding: preceeding && {
                    id: preceeding.id,
                    words: preceeding.words.map(mapWordToString).join(""),
                },
                following: following && {
                    id: following.id,
                    words: following.words.map(mapWordToString).join(""),
                },
            };
            return acc;
        },
        {} as Record<string, SentenceContext>,
    );
};
