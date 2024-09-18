import { getPaginatedCollocations } from "@/data/collocation";
import { getFileHeader } from "@/data/download/util";
import { getCorpusSize } from "@/data/meta";
import { ParsedSearchFilters } from "@/types/search.types";

export const downloadCollocationSearchResults = async (
    t: any,
    formatter: any,
    parsedSearchFilters: ParsedSearchFilters,
) => {
    parsedSearchFilters.page = 1;

    const corpusSize = await getCorpusSize(
        parsedSearchFilters.searchSource,
        parsedSearchFilters.texts === "with-error",
    );

    const { data: collocations } = await getPaginatedCollocations(
        parsedSearchFilters.lemma!.at(0)!,
        parsedSearchFilters,
        10000,
    );

    // Table header
    const tableHeader = [
        t("Collocation.table.words"),
        t("SearchResults.filters.wordClass"),
        t("Collocation.table.count"),
        t("Collocation.table.totalCount"),
        t("Collocation.table.logDice"),
        t("Collocation.table.errCount"),
    ];
    const headerRows: string[] = getFileHeader(
        t,
        formatter,
        corpusSize,
        tableHeader.length,
        parsedSearchFilters,
        "collocations",
    );
    headerRows.push(tableHeader.join("\t"));

    return new ReadableStream({
        async pull(controller) {
            // Send header
            controller.enqueue(headerRows.join("\n") + "\n");

            // Send table
            for (const collocation of collocations) {
                const row: string[] = [
                    collocation.lemma,
                    t(`Filters.Category.${collocation.wordClass}`),
                    formatter.number(collocation.count),
                    formatter.number(collocation.totalCount),
                    formatter.number(collocation.logDice),
                    formatter.number(collocation.errCount),
                ];

                controller.enqueue(row.join("\t") + "\n");
            }

            controller.close();
        },
    });
};
