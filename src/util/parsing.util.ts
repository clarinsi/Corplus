import { SearchType } from "@/app/[locale]/Search";
import { AdvFilterKeys, advFiltersSchema, filterDef } from "@/components/adv-search/config";
import {
    ADV_CONTEXT,
    ADV_FILTERS_SEPARATOR,
    ALIGN_LEFT,
    COLLOCATION_WORD_CATEGORY,
    CONTEXT_WORD,
    CONTEXT_WORD_SEPARATOR,
    ERRORS_FILTER,
    EXCLUDE_CATEGORY,
    FIRST_LANG_FILTER,
    FORMS_FILTER,
    HIGHLIGHT_ERRORS,
    INPUT_TYPE_FILTER,
    LEFT_DISTANCE,
    LEMMA,
    LIST_SEPARATOR,
    LIST_TYPE,
    NO_STRING_SEARCH,
    PROFIC_SLV_FILTER,
    PROGRAM_TYPE_FILTER,
    RAW_QUERY,
    RIGHT_DISTANCE,
    SEARCH_SOURCE,
    SHOW_CORRECT,
    SHOW_ORIG,
    SHOW_RELATIVE,
    SORT_ASC,
    SORT_BY,
    TASK_SETTING_FILTER,
    WORD_CATEGORY,
} from "@/constants";
import { TextSource } from "@/db/schema";
import { AdvContext, ParsedSearchFilters } from "@/types/search.types";

export const parsePageNumber = (number: string | null): number => {
    const parsedNumber = Number(number);
    if (isNaN(parsedNumber) || parsedNumber < 1) return 1;
    return parsedNumber;
};

export const decodeAna = (ana: string | undefined, tCategory: any, tSchema: any) => {
    if (!ana) return "";
    const cleaned = ana.replace("mte:", "").split("");
    const cat = cleaned.at(0)!;

    return cleaned
        .flatMap((val, index) => {
            if (val === "-") return [];
            if (index === 0) return tCategory[val];

            const catSchema = advFiltersSchema[cat];
            const key = catSchema[index - 1];
            return tSchema[key][val]?.toLowerCase();
        })
        .join("; ");
};

const parseBoolFilter = (filter: string | undefined, defaultValue: boolean) => {
    if (!filter) return defaultValue;
    return filter === "true";
};

export const parseSearchParams = (searchParams: URLSearchParams): ParsedSearchFilters => {
    return parseRawFilters(Object.fromEntries(searchParams.entries()));
};

export const parseRawFilters = (rawFilters: Record<string, string>): ParsedSearchFilters => {
    const baseFilters = {
        lemma:
            rawFilters[LEMMA] && rawFilters[LEMMA].length > 0
                ? decodeURIComponent(rawFilters[LEMMA]).split(ADV_FILTERS_SEPARATOR)
                : NO_STRING_SEARCH,
        texts: rawFilters.texts as "with-error" | undefined,
        type: parseSearchType(rawFilters.type),
        page: parsePageNumber(rawFilters.page),
        rawQuery: decodeURIComponent(rawFilters[RAW_QUERY] || "any"),
        showRelative: rawFilters[SHOW_RELATIVE] == "true",
        searchSource: parseSearchSource(rawFilters[SEARCH_SOURCE]),
        showOrig: rawFilters[SHOW_ORIG] == "true",
        showCorrect: rawFilters[SHOW_CORRECT] == "true",
        leftAlign: parseBoolFilter(rawFilters[ALIGN_LEFT], false),
        highlightErrors: parseBoolFilter(rawFilters[HIGHLIGHT_ERRORS], true),
        firstLang: rawFilters[FIRST_LANG_FILTER]
            ? decodeURIComponent(rawFilters[FIRST_LANG_FILTER]).split(LIST_SEPARATOR)
            : undefined,
        taskSetting: rawFilters[TASK_SETTING_FILTER]
            ? rawFilters[TASK_SETTING_FILTER].split(LIST_SEPARATOR)
            : undefined,
        proficSlv: rawFilters[PROFIC_SLV_FILTER]
            ? decodeURIComponent(rawFilters[PROFIC_SLV_FILTER]).replaceAll("+", " ").split(LIST_SEPARATOR)
            : undefined,
        programType: rawFilters[PROGRAM_TYPE_FILTER]
            ? decodeURIComponent(rawFilters[PROGRAM_TYPE_FILTER]).replaceAll("+", " ").split(LIST_SEPARATOR)
            : undefined,
        inputType: rawFilters[INPUT_TYPE_FILTER]
            ? decodeURIComponent(rawFilters[INPUT_TYPE_FILTER]).split(LIST_SEPARATOR)
            : undefined,
        wordCategory: rawFilters[WORD_CATEGORY],
        errorsFilters: rawFilters[ERRORS_FILTER]
            ? decodeURIComponent(rawFilters[ERRORS_FILTER]).split(LIST_SEPARATOR)
            : undefined,
        excludeCategory: rawFilters[EXCLUDE_CATEGORY] !== undefined,
        listType: rawFilters[LIST_TYPE],
        formsFilter: rawFilters[FORMS_FILTER]
            ? decodeURIComponent(rawFilters[FORMS_FILTER]).split(LIST_SEPARATOR)
            : undefined,
    };

    const collocationsFilters = {
        leftDistance: Number(rawFilters[LEFT_DISTANCE] ?? "0"),
        rightDistance: Number(rawFilters[RIGHT_DISTANCE] ?? "0"),
        useExactPosition: rawFilters[CONTEXT_WORD] === "true",
        context: rawFilters[CONTEXT_WORD],
        sortBy: rawFilters[SORT_BY],
        sortAsc: rawFilters[SORT_ASC] === "true",
        collocationWordCategory: rawFilters[COLLOCATION_WORD_CATEGORY],
    };

    const advContext = parseAdvContext(rawFilters[ADV_CONTEXT]);

    const advFilters = Object.entries(rawFilters).reduce(
        (acc, [key, value]) => {
            if (key in filterDef) {
                acc[key as AdvFilterKeys] = decodeURIComponent(value).split(ADV_FILTERS_SEPARATOR);
            }
            return acc;
        },
        {} as Record<AdvFilterKeys, string[]>,
    );

    return { ...baseFilters, ...collocationsFilters, advancedFilters: advFilters, advContext };
};

export const parseSearchType = (type?: string | null): SearchType => {
    if (!type) return "basic";
    return type as SearchType;
};

export const parseSearchSource = (source?: string | null): TextSource => {
    if (source === "correct" || source === "CORR") return "CORR";
    return "ORIG";
};

// &advContext=Lemma=pes;Degree=n,g;Aspect=o,a|Lemma=okno;Gender=n,g;Number=o,n
const parseAdvContext = (advContext?: string) => {
    if (!advContext) return undefined;
    const contextWords = decodeURIComponent(advContext).split(CONTEXT_WORD_SEPARATOR);

    const parsedContext: AdvContext[] = [];

    for (const context of contextWords) {
        const filters = context.split(LIST_SEPARATOR);
        if (filters.length === 0) continue;

        const output: Partial<AdvContext> = {};

        output.filters = filters.reduce(
            (acc, filter) => {
                const [key, value] = filter.split("=");

                if (key in filterDef) {
                    acc[key as AdvFilterKeys] = value.split(ADV_FILTERS_SEPARATOR);
                } else if (key === "Lemma") {
                    output[key] = decodeURIComponent(value).split(ADV_FILTERS_SEPARATOR);
                } else {
                    // @ts-ignore
                    output[key] = value;
                }
                return acc;
            },
            {} as Record<AdvFilterKeys, string[]>,
        );
        parsedContext.push(output as AdvContext);
    }

    return parsedContext;
};
