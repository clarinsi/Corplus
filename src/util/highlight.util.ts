import { WordData } from "@/data/searchv2";
import { TextSource, WordInsert } from "@/db/schema";
import { AdvContext } from "@/types/search.types";

export const isHighlighted = (
    w: Pick<WordInsert, "id" | "lemma" | "text">,
    keyword: WordData,
    type: TextSource,
): boolean => {
    if (keyword.type === type) return w.id === keyword.id;
    if (type === "ORIG") return w.id === keyword.errors.at(0)?.origWordId;
    if (type === "CORR") return w.id === keyword.errors.at(0)?.corrWordId;
    return false;
};

export const isInContext = (
    w: Pick<WordInsert, "id" | "lemma" | "text">,
    wordIndex: number,
    keywordIndex: number,
    context?: string,
    advContext?: AdvContext[],
    leftDistance: number = 0,
    rightDistance: number = 0,
): boolean => {
    const wordLemma = w.lemma;
    if (!advContext && !context) return false;
    if (!wordLemma || wordIndex < 0) return false;

    // Check if word is inside left or right distance from keyword
    const isInDistance = wordIndex >= keywordIndex - leftDistance && wordIndex <= keywordIndex + rightDistance;
    if (!isInDistance) return false;
    if (wordLemma === context) return true;

    // Check if word is in adv context
    return advContext?.some((c) => isIncluded(w, c)) ?? false;
};

const isIncluded = (w: Pick<WordInsert, "id" | "lemma" | "text">, c: AdvContext) => {
    if (!w.lemma) return false;

    if (c.Mode === "lemma") return c.Lemma.includes(w.lemma);

    // If mode is text, c.Lemma will just be the text instead of a lemma
    return c.Lemma.includes(w.text);
};
