import { getWordSearchFilters } from "@/data/searchv2";
import { dbClient } from "@/db/db";
import { Bibl, CountMeta, TextSource, Word } from "@/db/schema";
import { BiblInsert } from "@/db/schema/bibl.schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { and, count, desc, eq } from "drizzle-orm";

type BiblCountMetaItem = {
    [key in keyof Omit<BiblInsert, "id">]: string;
} & { count: string };

export interface BiblFilter {
    name: string;
    count: number;
    relative: number;
}

const getBiblTotalWordCount = async (
    column: keyof BiblInsert,
    searchSource: TextSource,
    searchText: undefined | "with-error",
): Promise<BiblCountMetaItem[]> => {
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
        .where(eq(CountMeta.name, column));

    return JSON.parse(result.at(0)?.counts ?? "[]");
};

const overrideBiblFilter = (field: keyof BiblInsert, parsedSearchFilters: ParsedSearchFilters) => {
    if (field === "FirstLang") parsedSearchFilters.firstLang = undefined;
    if (field === "TaskSetting") parsedSearchFilters.taskSetting = undefined;
    if (field === "ProficSlv") parsedSearchFilters.proficSlv = undefined;
    if (field === "ProgramType") parsedSearchFilters.programType = undefined;
    if (field === "InputType") parsedSearchFilters.inputType = undefined;
};

export const getGlobalSpeakerLangFilters = async (filters: ParsedSearchFilters): Promise<BiblFilter[]> => {
    // Get total word count
    const rawWordCount = await getBiblTotalWordCount("FirstLang", filters.searchSource, filters.texts);
    return rawWordCount.flatMap((i: any) => ({ name: i["FirstLang"], count: 0, relative: 0 }));
};

export const getBiblFilters = async (
    field: keyof Omit<BiblInsert, "id">,
    filters: ParsedSearchFilters,
): Promise<BiblFilter[]> => {
    // Get total word count
    const rawWordCount = await getBiblTotalWordCount(field, filters.searchSource, filters.texts);
    const mappedTotalCounts: Record<string, number> = {};
    rawWordCount.forEach((item) => {
        const value = item[field];
        if (value === undefined) return;
        mappedTotalCounts[value] = Number(item.count);
    });

    overrideBiblFilter(field, filters);
    const countAlias = count(Word.id);
    const queryBuilder = dbClient.select({ bibl: Bibl[field], count: countAlias }).from(Word).$dynamic();
    queryBuilder.where(and(...getWordSearchFilters(queryBuilder, filters)));
    queryBuilder.groupBy(Bibl[field]);
    queryBuilder.orderBy(desc(countAlias));

    const result = await queryBuilder;
    return result.flatMap((i) => {
        // Don't show empty values/nulls
        if (!i.bibl) return [];

        const totalCount = mappedTotalCounts[i.bibl];
        if (!totalCount) return { name: i.bibl, count: 0, relative: 0 };

        const relative = Number(((i.count / totalCount) * 1000000).toFixed(2));
        return { name: i.bibl, count: i.count, relative };
    });
};
