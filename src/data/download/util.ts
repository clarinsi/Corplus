import { SearchType } from "@/app/[locale]/Search";
import { AdvFilterKeys } from "@/components/adv-search/config";
import { ParsedSearchFilters } from "@/types/search.types";

export const getFileHeader = (
    t: any,
    formatter: any,
    corpusSize: number,
    tableHeaderSize: number,
    parsedSearchFilters: ParsedSearchFilters,
    searchType: SearchType,
) => {
    const headerRows: string[] = [];
    headerRows.push(`# ${t("Export.corpus")} ${t("Export.title")}`);
    headerRows.push(`# ${t("Export.size")} ${formatter.number(corpusSize)}`);

    let distance = [];
    if (parsedSearchFilters.leftDistance && parsedSearchFilters.type === "collocations")
        distance.push(t("Export.LeftDistance") + parsedSearchFilters.leftDistance);
    if (parsedSearchFilters.rightDistance && parsedSearchFilters.type === "collocations")
        distance.push(t("Export.RightDistance") + parsedSearchFilters.rightDistance);
    headerRows.push(`# ${t("Export.searchType.type")} ${t(`Export.searchType.${searchType}`)}, ${distance.join(", ")}`);

    headerRows.push(
        `# ${t("Export.searchSource.type")} ${t(`Export.searchSource.${parsedSearchFilters.searchSource}`)}`,
    );
    headerRows.push(`# ${t("Export.searchTerm")} ${parsedSearchFilters.rawQuery.replaceAll("+", " ")}`);
    headerRows.push(`# ${t("Export.filters")} ${serializeSearchFilters(t, parsedSearchFilters)}`);
    const selectedDisplayTypes = getSelectedDisplayTypes(parsedSearchFilters)
        .map((d) => t(`Export.display.${d}`))
        .join(", ");
    headerRows.push(`# ${t("Export.display.type")} ${selectedDisplayTypes}`);

    headerRows.forEach((_, i) => (headerRows[i] += "\t".repeat(tableHeaderSize - 1)));

    return headerRows;
};

export const getSelectedDisplayTypes = (parsedSearchFilters: ParsedSearchFilters) => {
    const selected = [];

    if (parsedSearchFilters.showOrig) selected.push("orig");
    if (parsedSearchFilters.showCorrect) selected.push("corr");

    return selected;
};

const serializeAdvFilters = (t: any, c: Record<AdvFilterKeys, string[]>) =>
    Object.entries(c).map(
        ([key, value]) =>
            t(`Filters.Schema.${key}.title`) + ": " + value.map((v) => t(`Filters.Schema.${key}.${v}`)).join(", "),
    );

export const serializeSearchFilters = (t: any, parsedSearchFilters: ParsedSearchFilters) => {
    const serialized: string[] = [];

    if (parsedSearchFilters.wordCategory) serialized.push(t(`Filters.Category.${parsedSearchFilters.wordCategory}`));
    if (parsedSearchFilters.advancedFilters) {
        const mapped = serializeAdvFilters(t, parsedSearchFilters.advancedFilters);
        serialized.push(...mapped);
    }
    if (parsedSearchFilters.texts === "with-error") serialized.push(t("Buttons.Texts.with-error"));
    if (parsedSearchFilters.firstLang) serialized.push(...parsedSearchFilters.firstLang);
    if (parsedSearchFilters.taskSetting) serialized.push(...parsedSearchFilters.taskSetting);
    if (parsedSearchFilters.proficSlv) serialized.push(...parsedSearchFilters.proficSlv);
    if (parsedSearchFilters.programType) serialized.push(...parsedSearchFilters.programType);
    if (parsedSearchFilters.inputType) serialized.push(...parsedSearchFilters.inputType);
    if (parsedSearchFilters.context) serialized.push(t("Export.advContext") + parsedSearchFilters.context);
    if (parsedSearchFilters.leftDistance && parsedSearchFilters.type !== "collocations")
        serialized.push(t("Export.LeftDistance") + parsedSearchFilters.leftDistance);
    if (parsedSearchFilters.rightDistance && parsedSearchFilters.type !== "collocations")
        serialized.push(t("Export.RightDistance") + parsedSearchFilters.rightDistance);
    if (parsedSearchFilters.useExactPosition) serialized.push(t("Export.DistanceMode") + t("Export.ExactPosition"));
    if (parsedSearchFilters.advContext) {
        const advContext: string[] = [];
        parsedSearchFilters.advContext.forEach((c) => {
            const tmp: string[] = [];
            tmp.push(t("Export.Lemma") + c.Lemma.join(", "));
            if (c.NotInContext) tmp.push(t("Export.NotInContext") + c.NotInContext);
            tmp.push(t("Export.Mode") + c.Mode);
            tmp.push(t("Export.DistanceMode") + t(`Export.${c.DistanceMode}`));
            tmp.push(t("Export.LeftDistance") + c.LeftDistance);
            tmp.push(t("Export.RightDistance") + c.RightDistance);

            const filters = serializeAdvFilters(t, c.filters);
            if (Object.keys(c.filters).length > 0) tmp.push(t("Export.filters") + filters.join(", "));

            advContext.push(t("Export.advContext") + tmp.join(", "));
        });

        serialized.push(...advContext);
    }
    if (parsedSearchFilters.sortBy) serialized.push(parsedSearchFilters.sortBy);
    if (parsedSearchFilters.sortAsc) serialized.push(String(parsedSearchFilters.sortAsc));
    if (parsedSearchFilters.collocationWordCategory)
        serialized.push(t(`Filters.Category.${parsedSearchFilters.collocationWordCategory}`));
    if (parsedSearchFilters.errorsFilters) serialized.push(...parsedSearchFilters.errorsFilters);
    if (parsedSearchFilters.excludeCategory) serialized.push(String(parsedSearchFilters.excludeCategory));
    if (parsedSearchFilters.formsFilter) serialized.push(...parsedSearchFilters.formsFilter);

    if (serialized.length === 0) return "/";
    return serialized.join(", ");
};
