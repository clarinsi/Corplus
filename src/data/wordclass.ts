import { addCollocationJoins, getCollocationAliases } from "@/data/collocation";
import { getWordSearchFilters } from "@/data/searchv2";
import { dbClient } from "@/db/db";
import { CountMeta, TextSource, Word } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { and, countDistinct, desc, eq, sql } from "drizzle-orm";

const getWordClassTotalWordCount = async (
    searchSource: TextSource,
    searchText: undefined | "with-error",
): Promise<{ wordClass: string; count: number }[]> => {
    let dataColumn: "origCounts" | "origWithErrCounts" | "corrCounts" | "corrWithErrCounts";
    if (searchSource === "ORIG") {
        dataColumn = searchText === undefined ? "origCounts" : "origWithErrCounts";
    } else {
        dataColumn = searchText === undefined ? "corrCounts" : "corrWithErrCounts";
    }

    const result = await dbClient
        .select({
            counts: CountMeta[dataColumn],
        })
        .from(CountMeta)
        .where(eq(CountMeta.name, "wordClass"));

    return JSON.parse(result.at(0)?.counts ?? "[]");
};

export const getWordClass = async (filters: ParsedSearchFilters) => {
    const rawWordClassCount = await getWordClassTotalWordCount(filters.searchSource, filters.texts);
    const mappedTotalCounts: Map<string, number> = new Map(rawWordClassCount?.map((i) => [i.wordClass, i.count]));

    // Clear word category filter to get all word classes
    filters.wordCategory = undefined;
    const count = countDistinct(Word.id);
    // language=text
    const wordClass = sql<string>`substring("Word"."ana", 5, 1)`.as("wordClass");
    const queryBuilder = dbClient.select({ wordClass, count }).from(Word).$dynamic();
    queryBuilder.where(and(...getWordSearchFilters(queryBuilder, filters)));
    queryBuilder.groupBy(wordClass);
    queryBuilder.orderBy(desc(count));

    const result = await queryBuilder.prepare("WordClassQuery").execute();
    return result.map((i) => {
        const totalCount = mappedTotalCounts.get(i.wordClass);
        if (!totalCount) return { name: i.wordClass, count: 0, relative: 0 };

        const relative = Number(((i.count / totalCount) * 1000000).toFixed(2));
        return { name: i.wordClass, count: i.count, relative };
    });
};

function groupByWordClass(data: Record<string, any>[]): Record<string, number> {
    const counts: Record<string, number> = {};

    data.forEach((entry) => {
        // Left class counts
        counts[entry.leftClass0] = counts[entry.leftClass0] || 0;
        counts[entry.leftClass0] += entry.leftCount0;

        counts[entry.leftClass1] = counts[entry.leftClass1] || 0;
        counts[entry.leftClass1] += entry.leftCount1;

        counts[entry.leftClass2] = counts[entry.leftClass2] || 0;
        counts[entry.leftClass2] += entry.leftCount2;

        // Right class counts (handle null values)
        counts[entry.rightClass0] = counts[entry.rightClass0] || 0;
        counts[entry.rightClass0] += entry.rightCount0;

        if (entry.rightClass1 !== null) {
            counts[entry.rightClass1] = counts[entry.rightClass1] || 0;
            counts[entry.rightClass1] += entry.rightCount1;
        }

        if (entry.rightClass2 !== null) {
            counts[entry.rightClass2] = counts[entry.rightClass2] || 0;
            counts[entry.rightClass2] += entry.rightCount2;
        }
    });

    delete counts["null"];

    return counts;
}

export const getCollocationsWordClass = async (lemma: string, filters: ParsedSearchFilters) => {
    const rawWordClassCount = await getWordClassTotalWordCount(filters.searchSource, filters.texts);
    const mappedTotalCounts: Map<string, number> = new Map(rawWordClassCount?.map((i) => [i.wordClass, i.count]));

    // Clear word category filter to get all word classes
    filters.wordCategory = undefined;
    filters.collocationWordCategory = undefined;

    const aliases = getCollocationAliases(filters.leftDistance, filters.rightDistance);

    const leftAliases = aliases.left.map((a) => sql<string>`substring(${a}.ana, 5, 1)`);
    const leftCounts = aliases.left.map((a) => countDistinct(a.id));
    const rightAliases = aliases.right.map((a) => sql<string>`substring(${a}.ana, 5, 1)`);
    const rightCounts = aliases.right.map((a) => countDistinct(a.id));

    const select: Record<string, any> = {};
    leftAliases.forEach((a, i) => (select[`leftClass${i}`] = a));
    leftCounts.forEach((a, i) => (select[`leftCount${i}`] = a));
    rightAliases.forEach((a, i) => (select[`rightClass${i}`] = a));
    rightCounts.forEach((a, i) => (select[`rightCount${i}`] = a));

    const queryBuilder = dbClient.select(select).from(Word).$dynamic();

    queryBuilder.where(and(...getWordSearchFilters(queryBuilder, filters, undefined, false, true)));
    addCollocationJoins(queryBuilder, aliases);
    queryBuilder.groupBy(...leftAliases, ...rightAliases);

    const result = await queryBuilder.prepare("words-coll-classes").execute();
    const grouped = groupByWordClass(result);

    return Object.entries(grouped).map(([wordClass, count]) => {
        const totalCount = mappedTotalCounts.get(wordClass);
        if (!totalCount) return { name: wordClass, count: 0, relative: 0 };

        const relative = Number(((count / totalCount) * 1000000).toFixed(2));
        return { name: wordClass, count: count, relative };
    });
};
