import { BiblFilter } from "@/data/filters";
import { getWordSearchFilters } from "@/data/searchv2";
import { dbClient } from "@/db/db";
import { CountMeta, Err, Word } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { and, count, desc, eq, not } from "drizzle-orm";

export const getErrsFilters = async (parsedFilters: ParsedSearchFilters): Promise<BiblFilter[]> => {
    const allCounts = (await dbClient.select().from(CountMeta).where(eq(CountMeta.name, "errs"))).at(0);
    if (!allCounts) return [];

    const cleanParsedFilters = { ...parsedFilters };
    // Remove any active error filters to get the total counts
    cleanParsedFilters.errorsFilters = undefined;

    const countAlias = count(Word.id);
    const queryBuilder = dbClient.select({ type: Err.type, count: countAlias }).from(Err).$dynamic();
    queryBuilder.innerJoin(
        Word,
        parsedFilters.searchSource === "CORR" ? eq(Err.corrWordId, Word.id) : eq(Err.origWordId, Word.id),
    );
    queryBuilder.where(
        and(not(eq(Err.type, "ID")), ...getWordSearchFilters(queryBuilder, cleanParsedFilters, undefined, true)),
    );
    queryBuilder.groupBy(Err.type);
    queryBuilder.orderBy(desc(countAlias));

    let totalCounts: { type: string; count: number }[];
    const currentCounts = await queryBuilder;

    if (parsedFilters.searchSource === "CORR") totalCounts = JSON.parse(allCounts.corrCounts);
    else totalCounts = JSON.parse(allCounts.origCounts);

    return currentCounts.flatMap((current) => {
        const total = totalCounts.find((c: any) => c.type === current.type);
        if (!total) return [];

        return {
            name: current.type,
            count: current.count,
            relative: Number(((current.count / total.count) * 1000000).toFixed(2)),
        };
    });
};
