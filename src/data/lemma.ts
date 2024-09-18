import { getCollocationAliases } from "@/data/collocation";
import { getCorpusSize } from "@/data/meta";
import { getWordSearchFilters } from "@/data/searchv2";
import { dbClient } from "@/db/db";
import { Word } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { and, count, desc, eq, or, sql } from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";

export interface LemmaForm {
    label: string;
    lemma: string;
    context: (string | null)[];
}

export interface LemmaFormCount extends LemmaForm {
    count: number;
    relative: number;
}

export const getLemmaFormsv3 = async (
    searchString: string,
    parsedFilters: ParsedSearchFilters,
): Promise<LemmaForm[]> => {
    const isMultiWord = decodeURIComponent(parsedFilters.rawQuery).includes(" ");
    // We don't want to restrict to specific lemmas
    if (parsedFilters.type === "basic" && !isMultiWord) {
        parsedFilters.lemma = undefined;
    }

    let aliases = undefined;
    if (isMultiWord && parsedFilters.advContext) {
        const maxDistance = Math.max(...parsedFilters.advContext.map((ctx) => ctx.RightDistance));
        aliases = getCollocationAliases(0, maxDistance);
    }

    const selectQuery: Record<string, PgColumn> = { lemma: Word.lemma };
    if (aliases) aliases.right.forEach((a, i) => (selectQuery[`cxr${i}`] = a.lemma));

    const groupBy: PgColumn[] = [Word.lemma];
    if (aliases) groupBy.push(...aliases.right.map((a) => a.lemma));

    const lemmaFormsQb = dbClient.select(selectQuery).from(Word).$dynamic();
    const lemmaFormsWhere = getWordSearchFilters(lemmaFormsQb, parsedFilters, undefined, false, false, aliases);

    if (parsedFilters.type !== "list" && parsedFilters.lemma === undefined && searchString !== "any") {
        lemmaFormsWhere.push(
            or(
                eq(Word.lemma, searchString),
                eq(Word.text, sql`lower(${searchString})`),
                eq(Word.text, sql`initcap(${searchString})`),
            ),
        );
    }

    lemmaFormsQb.where(and(...lemmaFormsWhere));
    lemmaFormsQb.groupBy(...groupBy);
    lemmaFormsQb.prepare("lemmaForms");

    const res = await lemmaFormsQb.execute();

    if (res.length === 0) {
        throw new Error("No lemma forms found");
    }

    return res.flatMap((w) => {
        if (!w.lemma) return [];

        const entires = Object.entries(w);
        const context = entires.filter(([key]) => key.startsWith("cxr")).map(([, val]) => val);
        return { label: `${w.lemma} ${context?.join(" ")}`.trim(), lemma: w.lemma, context };
    });
};

export const getAndCountLemmaForms = async (
    searchString: string,
    parsedFilters: ParsedSearchFilters,
): Promise<LemmaFormCount[]> => {
    const isMultiWord = decodeURIComponent(parsedFilters.rawQuery).includes(" ");
    const shouldSkipInitialForms = parsedFilters.type === "list";

    // If we are doing a list search we don't need to fetch the initial list of possible lemma forms
    if (!shouldSkipInitialForms) {
        const lemmaForms = await getLemmaFormsv3(searchString, parsedFilters);

        // Reset lemmas to only ones that are found in search results
        parsedFilters.lemma = lemmaForms.map((l) => l.lemma);
        // Clear lemmas in adv context
        parsedFilters.advContext?.forEach((c) => (c.Lemma = []));
        // Add lemmas that are found in search results to adv context
        lemmaForms.forEach((l) => l.context.forEach((c, i) => c && parsedFilters.advContext?.at(i)?.Lemma?.push(c)));
    }

    let aliases = undefined;
    if (isMultiWord && parsedFilters.advContext) {
        const maxDistance = Math.max(...parsedFilters.advContext.map((ctx) => ctx.RightDistance));
        aliases = getCollocationAliases(0, maxDistance);
    }

    const counter = count(Word.id);
    const selectQuery = { lemma: Word.lemma, count: counter };
    // @ts-expect-error
    if (aliases) aliases.right.forEach((a, i) => (selectQuery[`cxr${i}`] = a.lemma));

    const groupBy: PgColumn[] = [Word.lemma];
    if (aliases) groupBy.push(...aliases.right.map((a) => a.lemma));

    const lemmaFormsQb = dbClient.select(selectQuery).from(Word).$dynamic();
    // This is needed to get actual counts for all lemma forms which is not possible with the previous query
    const lemmaFormsWhere = getWordSearchFilters(lemmaFormsQb, parsedFilters, undefined, false, false, aliases);

    lemmaFormsQb.where(and(...lemmaFormsWhere));
    lemmaFormsQb.groupBy(...groupBy);
    lemmaFormsQb.orderBy(desc(counter));
    lemmaFormsQb.prepare("lemmaFormsCount");

    const corpusSize = await getCorpusSize(parsedFilters.searchSource, parsedFilters.texts === "with-error");

    return (await lemmaFormsQb.execute()).flatMap((w) => {
        if (!w.lemma) return [];

        const entires = Object.entries(w);
        const context = entires.filter(([key]) => key.startsWith("cxr")).map(([, val]) => val as string | null);

        return {
            label: `${w.lemma} ${context?.join(" ")}`.trim(),
            lemma: w.lemma,
            context,
            count: w.count,
            relative: Number(((w.count / corpusSize) * 1000000).toFixed(2)),
        };
    });
};
