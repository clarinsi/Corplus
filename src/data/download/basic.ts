import { getBiblData } from "@/data/bibl";
import { getFileHeader } from "@/data/download/util";
import { getCorpusSize } from "@/data/meta";
import { WordData, getSentences, getWords } from "@/data/searchv2";
import { BiblSelect } from "@/db/schema";
import { ParsedSearchFilters } from "@/types/search.types";
import { punctuationRegex } from "@/util/util";

export const downloadBasicSearchResults = async (t: any, formatter: any, parsedSearchFilters: ParsedSearchFilters) => {
    parsedSearchFilters.page = 1;

    const corpusSize = await getCorpusSize(
        parsedSearchFilters.searchSource,
        parsedSearchFilters.texts === "with-error",
    );
    const words = await getWords(parsedSearchFilters, 100000);
    const sentences = await getSentences(words);
    const biblIds = new Set(sentences.map((s) => s.keyword.biblId!));
    const biblEntries = await getBiblData(Array.from(biblIds));

    // Table header
    const tableHeader = [
        t("Export.sentence"),
        t("Export.sentenceType"),
        t("Export.errorType"),
        t("Metadata.firstLang"),
        t("SearchResults.filters.task-setting"),
        t("SearchResults.filters.profic-slv"),
        t("SearchResults.filters.program-type"),
        t("SearchResults.filters.input-type"),
    ];
    const headerRows: string[] = getFileHeader(
        t,
        formatter,
        corpusSize,
        tableHeader.length,
        parsedSearchFilters,
        "basic",
    );
    headerRows.push(tableHeader.join("\t"));

    return new ReadableStream({
        async pull(controller) {
            // Send header
            controller.enqueue(headerRows.join("\n") + "\n");

            // Send table
            for (const sentence of sentences) {
                const biblEntry = biblEntries.find((b) => b.id === sentence.keyword.biblId);

                if (parsedSearchFilters.showOrig)
                    controller.enqueue(serializeSentence(t, sentence.orig?.words ?? [], sentence.keyword, biblEntry));

                if (parsedSearchFilters.showCorrect)
                    controller.enqueue(serializeSentence(t, sentence.corr?.words ?? [], sentence.keyword, biblEntry));
            }

            controller.close();
        },
    });
};

const serializeSentence = (t: any, words: WordData[], keyword: WordData, biblEntry?: BiblSelect): string => {
    const row = [
        words
            .map((w) => {
                const isKeyword = w.isKeyword;
                const text = isKeyword ? `<b>${w.text}</b>` : w.text;
                const isPunctuation = punctuationRegex.test(w.text);
                return !isPunctuation ? ` ${text}` : text;
            })
            .join("")
            .trim() || "",
        t("Export.orig"),
        keyword.errors
            .filter((e) => e.type !== "ID")
            .map((e) => `${t(`ErrorCodes.${e.type}.category`)}: ${t(`ErrorCodes.${e.type}.name`)}`),
        biblEntry?.FirstLang ?? "",
        biblEntry?.TaskSetting ?? "",
        biblEntry?.ProficSlv ?? "",
        biblEntry?.ProgramType ?? "",
        biblEntry?.InputType ?? "",
    ];

    return row.join("\t") + "\n";
};
