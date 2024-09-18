import { getWordSearchFilters } from "@/data/searchv2";
import { dbClient } from "@/db/db";
import { Err, Word } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { and, asc, countDistinct, desc, eq, not } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";

export interface ListStats {
    lemma: string | null;
    count: number;
    errCount: number;
    text?: string;
    ana?: string;
}

export const getPaginatedLists = async (
    parsedSearchFilters: ParsedSearchFilters,
    itemsPerPage = 50,
): Promise<PaginatedResponse<ListStats[]>> => {
    const { listType, sortAsc, sortBy } = parsedSearchFilters;
    let groupBy: any[] = [Word.text, Word.lemma];
    if (listType === "lemma") groupBy = [Word.lemma];
    if (listType === "ana") groupBy = [Word.ana, Word.text, Word.lemma];
    const origErr = alias(Err, "orig");
    const corrErr = alias(Err, "corr");

    const countWords = countDistinct(Word.id);
    const countErr = countDistinct(parsedSearchFilters.searchSource === "ORIG" ? origErr.id : corrErr.id);

    const queryBuilder = dbClient
        .select({
            lemma: Word.lemma,
            count: countWords,
            errCount: countErr,
            ...((listType === "text" || listType === "ana") && { text: Word.text }),
            ...(listType === "ana" && { ana: Word.ana }),
        })
        .from(Word)
        .$dynamic();

    queryBuilder
        .leftJoin(origErr, and(eq(origErr.origWordId, Word.id), not(eq(origErr.type, "ID"))))
        .leftJoin(corrErr, and(eq(corrErr.corrWordId, Word.id), not(eq(corrErr.type, "ID"))));

    queryBuilder.where(and(...getWordSearchFilters(queryBuilder, parsedSearchFilters, undefined, false, false)));

    queryBuilder.groupBy(...groupBy);

    switch (sortBy) {
        case "text":
            queryBuilder.orderBy(sortAsc ? asc(Word.text) : desc(Word.text));
            break;
        case "lemma":
            queryBuilder.orderBy(sortAsc ? asc(Word.lemma) : desc(Word.lemma));
            break;
        case "count":
        default:
            queryBuilder.orderBy(sortAsc ? asc(countWords) : desc(countWords));
            break;
        case "errCount":
            queryBuilder.orderBy(sortAsc ? asc(countErr) : desc(countErr));
            break;
    }

    const result = await queryBuilder.prepare("words-list").execute();

    // Pagination
    const resultsPage = result.slice(
        (parsedSearchFilters.page - 1) * itemsPerPage,
        parsedSearchFilters.page * itemsPerPage,
    );

    // Metadata
    const encodedLemma = encodeURIComponent(parsedSearchFilters.rawQuery);
    const currentPage = parsedSearchFilters.page;
    const totalPages = Math.ceil(result.length / itemsPerPage);

    return {
        data: resultsPage,
        meta: { currentPage, itemsPerPage, totalItems: result.length, totalPages },
        links: {
            first: `/${encodedLemma}?page=1`,
            previous: `/${encodedLemma}?page=${currentPage > 2 ? currentPage - 1 : 1}`,
            current: `/${encodedLemma}?page=${currentPage}`,
            next: `/${encodedLemma}?page=${currentPage + 1}`,
            last: `/${encodedLemma}?page=${totalPages}`,
        },
    };
};
