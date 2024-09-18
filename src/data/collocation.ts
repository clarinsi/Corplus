import { LIST_SEPARATOR } from "@/constants";
import { getWordSearchFilters } from "@/data/searchv2";
import { dbClient } from "@/db/db";
import { Err, TextSource, Word } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { TableConfig, and, count, eq, not, sql } from "drizzle-orm";
import { BuildAliasTable, PgSelect, PgTable, alias } from "drizzle-orm/pg-core";

export interface CollocationStats {
    lemma: string;
    count: number;
    totalCount: number;
    logDice: number;
    errCount: number;
    wordClass: string;
}

const calculateStats = (totalKeywordCount: number, collocationCount: number, totalCollocationCount: number) => {
    const dice = (2 * collocationCount) / (totalKeywordCount + totalCollocationCount);
    // logDice
    const logDice = 14 + Math.log2(dice);

    return { logDice: Number(logDice.toFixed(3)) };
};

export const getTotalCollocationCounts = async (collocations: string[], searchSource: TextSource) => {
    return await dbClient
        .select({
            lemma: Word.lemma,
            count: count(Word.id),
        })
        .from(Word)
        .where(and(eq(Word.type, searchSource), sql`"Word"."lemma" IN ${collocations}`))
        .groupBy(Word.lemma)
        .prepare("collocation-count")
        .execute();
};

export type AliasContainer<T extends PgTable<TableConfig>> = {
    left: BuildAliasTable<T, string>[];
    right: BuildAliasTable<T, string>[];
};

export const getCollocationAliases = (leftDistance: number, rightDistance: number) => {
    const aliases: AliasContainer<typeof Word> = { left: [], right: [] };

    for (let i = 1; i <= leftDistance; i++) {
        const tmp = `cxl${i}`;
        aliases.left.push(alias(Word, tmp));
    }

    for (let i = 1; i <= rightDistance; i++) {
        const tmp = `cxr${i}`;
        aliases.right.push(alias(Word, tmp));
    }

    return aliases;
};

export const getCollocationErrorAliases = (leftDistance: number, rightDistance: number) => {
    const aliases: AliasContainer<typeof Err> = { left: [], right: [] };

    for (let i = 1; i <= leftDistance; i++) {
        const tmp = `cxl${i}e`;
        aliases.left.push(alias(Err, tmp));
    }

    for (let i = 1; i <= rightDistance; i++) {
        const tmp = `cxr${i}e`;
        aliases.right.push(alias(Err, tmp));
    }

    return aliases;
};

export function addCollocationJoins<T extends PgSelect>(queryBuilder: T, aliases: AliasContainer<typeof Word>) {
    for (let i = 0; i < aliases.left.length; i++) {
        const alias = aliases.left[i];

        if (i === 0) {
            queryBuilder.leftJoin(alias, eq(Word.prevContext, alias.id));
            continue;
        }

        const prevAlias = aliases.left[i - 1];
        queryBuilder.leftJoin(alias, eq(prevAlias.prevContext, alias.id));
    }

    for (let i = 0; i < aliases.right.length; i++) {
        const alias = aliases.right[i];

        if (i === 0) {
            queryBuilder.leftJoin(alias, eq(Word.nextContext, alias.id));
            continue;
        }

        const prevAlias = aliases.right[i - 1];
        queryBuilder.leftJoin(alias, eq(prevAlias.nextContext, alias.id));
    }
}

export function addCollocationErrorJoins<T extends PgSelect>(
    queryBuilder: T,
    searchSource: TextSource,
    aliases: AliasContainer<typeof Word>,
    errAliases: AliasContainer<typeof Err>,
) {
    const selector = searchSource === "ORIG" ? "origWordId" : "corrWordId";
    for (let i = 0; i < errAliases.left.length; i++) {
        const alias = aliases.left[i];
        const errAlias = errAliases.left[i];

        queryBuilder.leftJoin(errAlias, and(eq(errAlias[selector], alias.id), not(eq(errAlias.type, "ID"))));
    }

    for (let i = 0; i < errAliases.right.length; i++) {
        const alias = aliases.right[i];
        const errAlias = errAliases.right[i];

        queryBuilder.leftJoin(errAlias, and(eq(errAlias[selector], alias.id), not(eq(errAlias.type, "ID"))));
    }
}

const isMatchingFilters = (
    lemma: string | null,
    ana: string | null,
    leftDistance: number,
    rightDistance: number,
    parsedSearchFilters: ParsedSearchFilters,
) => {
    const { context, advContext, collocationWordCategory } = parsedSearchFilters;
    if (context && advContext === undefined) {
        if (!parsedSearchFilters.useExactPosition) {
            return lemma === context;
        }
    }

    if (collocationWordCategory) {
        const categories = collocationWordCategory.split(LIST_SEPARATOR);
        return categories.some((cat) => ana?.startsWith(`mte:${cat}`));
    }

    return true;
};

export function groupByLemma(
    data: Record<string, any>[],
    parsedSearchFilters: ParsedSearchFilters,
): Record<string, { count: number; errCount: number; wordClass: string }> {
    const counts: Record<string, { count: number; errCount: number; wordClass: string }> = {};

    for (const entry of data) {
        for (let i = 0; i < 5; i++) {
            // Left class counts
            if (
                entry[`leftLemma${i}`] !== undefined &&
                isMatchingFilters(entry[`leftLemma${i}`], entry[`leftAna${i}`], i, 0, parsedSearchFilters)
            ) {
                counts[entry[`leftLemma${i}`]] = counts[entry[`leftLemma${i}`]] || { count: 0, errCount: 0 };
                counts[entry[`leftLemma${i}`]].count += entry[`leftCount${i}`];
                counts[entry[`leftLemma${i}`]].errCount += entry[`leftErr${i}`];
                counts[entry[`leftLemma${i}`]].wordClass = entry[`leftAna${i}`]?.at(4);
            }

            // Right class counts
            if (
                entry[`rightLemma${i}`] !== undefined &&
                isMatchingFilters(entry[`rightLemma${i}`], entry[`rightAna${i}`], 0, i, parsedSearchFilters)
            ) {
                counts[entry[`rightLemma${i}`]] = counts[entry[`rightLemma${i}`]] || { count: 0, errCount: 0 };
                counts[entry[`rightLemma${i}`]].count += entry[`rightCount${i}`];
                counts[entry[`rightLemma${i}`]].errCount += entry[`rightErr${i}`];
                counts[entry[`rightLemma${i}`]].wordClass = entry[`rightAna${i}`]?.at(4);
            }
        }
    }

    delete counts["null"];
    return counts;
}

export const getCollocations = async (parsedSearchFilters: ParsedSearchFilters) => {
    const aliases = getCollocationAliases(parsedSearchFilters.leftDistance, parsedSearchFilters.rightDistance);
    const errAliases = getCollocationErrorAliases(parsedSearchFilters.leftDistance, parsedSearchFilters.rightDistance);

    const select: Record<string, any> = {};
    aliases.left.forEach((a, index) => {
        select[`leftLemma${index}`] = a.lemma;
        select[`leftAna${index}`] = a.ana;
        select[`leftCount${index}`] = count(a.id);
    });

    aliases.right.forEach((a, index) => {
        select[`rightLemma${index}`] = a.lemma;
        select[`rightAna${index}`] = a.ana;
        select[`rightCount${index}`] = count(a.id);
    });

    errAliases.left.forEach((a, index) => (select[`leftErr${index}`] = count(a.id)));
    errAliases.right.forEach((a, index) => (select[`rightErr${index}`] = count(a.id)));

    const queryBuilder = dbClient.select(select).from(Word).$dynamic();

    queryBuilder.where(
        and(...getWordSearchFilters(queryBuilder, parsedSearchFilters, undefined, false, true, aliases)),
    );
    addCollocationJoins(queryBuilder, aliases);
    addCollocationErrorJoins(queryBuilder, parsedSearchFilters.searchSource, aliases, errAliases);

    queryBuilder.groupBy(
        ...aliases.left.map((a) => a.lemma),
        ...aliases.left.map((a) => a.ana),
        ...aliases.right.map((a) => a.lemma),
        ...aliases.right.map((a) => a.ana),
    );

    return await queryBuilder.prepare("words-coll").execute();
};

export const getPaginatedCollocations = async (
    searchLemma: string,
    parsedSearchFilters: ParsedSearchFilters,
    limit: number,
): Promise<PaginatedResponse<CollocationStats[]>> => {
    const result = await getCollocations(parsedSearchFilters);

    const collocations: Record<string, { count: number; errCount: number; wordClass: string }> = groupByLemma(
        result,
        parsedSearchFilters,
    );

    delete collocations[searchLemma];
    const collocationEntries = Object.entries(collocations);

    const collocationsLemmas = collocationEntries.map(([lemma]) => lemma);
    collocationsLemmas.push(searchLemma);
    const totalCounts = await getTotalCollocationCounts(collocationsLemmas, parsedSearchFilters.searchSource);

    const stats = collocationEntries.map(([lemma, { count, errCount, wordClass }]) => {
        const totalCount = totalCounts.find((row) => row.lemma === lemma)?.count ?? 0;
        const { logDice } = calculateStats(
            totalCounts.find((row) => row.lemma === searchLemma)?.count ?? 0,
            count,
            totalCount,
        );
        return { lemma, count, errCount, logDice, totalCount, wordClass };
    });

    // Pagination & Sorting
    const { sortBy, sortAsc } = parsedSearchFilters;
    const statsPage = stats
        .sort((a, b) => {
            if (sortBy === "words") {
                return sortAsc ? a.lemma.localeCompare(b.lemma) : b.lemma.localeCompare(a.lemma);
            } else if (sortBy === "count") {
                return sortAsc ? a.count - b.count : b.count - a.count;
            } else if (sortBy === "totalCount") {
                return sortAsc ? a.totalCount - b.totalCount : b.totalCount - a.totalCount;
            } else if (sortBy === "logDice" || sortBy === undefined) {
                return sortAsc ? a.logDice - b.logDice : b.logDice - a.logDice;
            } else if (sortBy === "errCount") {
                return sortAsc ? a.errCount - b.errCount : b.errCount - a.errCount;
            }
            return 0;
        })
        .slice((parsedSearchFilters.page - 1) * limit, parsedSearchFilters.page * limit);

    // Metadata
    const encodedLemma = encodeURIComponent(searchLemma);
    const currentPage = parsedSearchFilters.page;
    const totalPages = Math.ceil(collocationEntries.length / limit);

    return {
        data: statsPage,
        meta: { currentPage, itemsPerPage: limit, totalItems: collocationEntries.length, totalPages },
        links: {
            first: `/${encodedLemma}?page=1`,
            previous: `/${encodedLemma}?page=${currentPage > 2 ? currentPage - 1 : 1}`,
            current: `/${encodedLemma}?page=${currentPage}`,
            next: `/${encodedLemma}?page=${currentPage + 1}`,
            last: `/${encodedLemma}?page=${totalPages}`,
        },
    };
};
