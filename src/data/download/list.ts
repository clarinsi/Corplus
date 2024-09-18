import { getFileHeader } from "@/data/download/util";
import { getPaginatedLists } from "@/data/list";
import { getCorpusSize } from "@/data/meta";
import { ParsedSearchFilters } from "@/types/search.types";
import { decodeAna } from "@/util/parsing.util";

export const downloadListSearchResults = async (t: any, formatter: any, parsedSearchFilters: ParsedSearchFilters) => {
    parsedSearchFilters.page = 1;

    const corpusSize = await getCorpusSize(
        parsedSearchFilters.searchSource,
        parsedSearchFilters.texts === "with-error",
    );

    const { data: lists } = await getPaginatedLists(parsedSearchFilters, 10000);
    const isLemma = parsedSearchFilters.listType === "lemma";
    const isAna = parsedSearchFilters.listType === "ana";

    // Table header
    const tableHeader: string[] = [
        !isLemma ? t("List.table.form") : [],
        t("List.table.basic-form"),
        t("List.table.count"),
        isAna ? t("List.table.ana") : !isLemma ? t("List.table.err-count") : [],
    ].flat();
    const headerRows: string[] = getFileHeader(
        t,
        formatter,
        corpusSize,
        tableHeader.length,
        parsedSearchFilters,
        "list",
    );
    headerRows.push(tableHeader.join("\t"));

    return new ReadableStream({
        async pull(controller) {
            // Send header
            controller.enqueue(headerRows.join("\n") + "\n");

            // Send table
            for (const list of lists) {
                const row: string[] = [
                    !isLemma ? list.text! : [],
                    list.lemma!,
                    formatter.number(list.count),
                    isAna
                        ? decodeAna(list.ana, t.raw("Filters.Category"), t.raw("Filters.Schema"))
                        : !isLemma
                          ? formatter.number(list.errCount)
                          : [],
                ].flat();

                controller.enqueue(row.join("\t") + "\n");
            }

            controller.close();
        },
    });
};
