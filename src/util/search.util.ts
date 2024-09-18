import { ReadonlyURLSearchParams } from "next/navigation";
import { SearchType } from "@/app/[locale]/Search";
import {
    ADV_CONTEXT,
    ADV_FILTERS_SEPARATOR,
    ERRORS_FILTER,
    EXCLUDE_CATEGORY,
    FIRST_LANG_FILTER,
    LEMMA,
    NO_STRING_SEARCH,
    RAW_QUERY,
    SEARCH_SOURCE,
    SHOW_CORRECT,
    SHOW_ORIG,
    TEXTS_FILTER,
    WORD_CATEGORY,
} from "@/constants";
import { LemmaForm, LemmaFormCount } from "@/data/lemma";
import { TextSource } from "@/db/schema";
import { SearchHistoryItem } from "@/types/search.types";

const searchTypeMap: Record<SearchType, string> = {
    basic: "",
    collocations: "/collocation",
    list: "/list",
};

const parseSearchQuery = (formValue: FormDataEntryValue | null) => {
    if (!formValue) return NO_STRING_SEARCH;
    let trimmed = String(formValue).trim();

    if (trimmed === "") return NO_STRING_SEARCH;

    return trimmed;
};

export const executeSearch = async (
    e: any,
    selectedSearchType: SearchType,
    textSource: TextSource,
    selectedCategory: string | undefined,
    existingParams: ReadonlyURLSearchParams,
    locale: string,
    excludeCategory: boolean = false,
) => {
    e.preventDefault();

    const formData = new FormData(e.target as HTMLFormElement);

    // Parse form data
    const searchQuery = parseSearchQuery(formData.get("search-string"));

    // Remove consumed values from form data
    formData.delete("search-string");

    let searchType = selectedSearchType;
    let skipSubpage = false;
    let lemmaParam = searchQuery;

    // Filters populated from search params
    const withErrorsFilter = existingParams.get(TEXTS_FILTER);
    const firstLangfilter = existingParams.get(FIRST_LANG_FILTER);
    const errorFilters = existingParams.get(ERRORS_FILTER);

    const newParams = new URLSearchParams();
    newParams.set(SEARCH_SOURCE, textSource);
    withErrorsFilter && newParams.set(TEXTS_FILTER, withErrorsFilter);
    errorFilters && newParams.set(ERRORS_FILTER, errorFilters);
    firstLangfilter && newParams.set(FIRST_LANG_FILTER, firstLangfilter);
    selectedCategory && newParams.set(WORD_CATEGORY, selectedCategory);
    excludeCategory && newParams.set(EXCLUDE_CATEGORY, "true");

    if (textSource === "ORIG") {
        newParams.set(SHOW_ORIG, "true");
        newParams.delete(SHOW_CORRECT);
    }
    if (textSource === "CORR") {
        newParams.set(SHOW_CORRECT, "true");
        newParams.delete(SHOW_ORIG);
    }

    if (!searchQuery && !errorFilters) return;

    if (searchQuery && lemmaParam) {
        newParams.set(LEMMA, lemmaParam);

        // Modifiers
        const isMultiWord = searchQuery.includes(" ");

        const isQuoted = searchQuery.startsWith('"') && searchQuery.endsWith('"');
        if (isQuoted) {
            searchType = "list";
            skipSubpage = true;

            if (isMultiWord) {
                const words = searchQuery.replaceAll('"', "").split(" ");
                lemmaParam = words.at(0)!.replaceAll('"', "");

                words.slice(1).forEach((contextWord, index) => {
                    // Offset by 1 since we sliced the first lemma
                    const offset = index + 1;

                    formData.append(
                        "AdvContext",
                        `Lemma=${contextWord};Mode=text;DistanceMode=exact;LeftDistance=0;RightDistance=${offset}`,
                    );
                });
            } else {
                lemmaParam = searchQuery.replaceAll('"', "");
            }

            newParams.set(LEMMA, lemmaParam);
        }

        if ((searchType === "basic" || searchType === "collocations") && !isMultiWord) {
            // Needed here for lemma-forms fetch request
            newParams.set("type", "basic");
            const resp = await fetch(`/api/lemma-forms/${lemmaParam}?${newParams.toString()}`);
            if (resp.status !== 200) {
                window.location.href = `${locale}/404`;
            }
            const lemmaForms = (await resp.json()) as LemmaForm[];
            newParams.set(LEMMA, lemmaForms.map(({ lemma }) => lemma).join(ADV_FILTERS_SEPARATOR));
        }

        if (searchType === "basic" && isMultiWord) {
            const words = searchQuery.split(" ");

            const response = await fetch(`/api/lemma-forms/bulk/${words.join("/")}?${newParams.toString()}`);
            if (response.status !== 200) {
                window.location.href = `${locale}/404`;
            }
            const json: LemmaFormCount[][] = await response.json();
            const primaryLemmas = json[0].map(({ lemma }) => lemma).join(ADV_FILTERS_SEPARATOR);
            newParams.set(LEMMA, primaryLemmas);

            json.slice(1).forEach((contextLemmaForms, index) => {
                // Offset by 1 since we sliced the first lemma
                const offset = index + 1;
                const contextLemmas = contextLemmaForms.map(({ lemma }) => lemma).join(ADV_FILTERS_SEPARATOR);

                formData.append(
                    "AdvContext",
                    `Lemma=${contextLemmas};Mode=lemma;DistanceMode=exact;LeftDistance=0;RightDistance=${offset}`,
                );
            });
        }
    }

    // Advanced filters/context
    const mappedAdvFilters = mapFormDataToObj(Array.from(formData.entries()));
    const advContext = (mappedAdvFilters.AdvContext as string[] | undefined)?.join("|");
    delete mappedAdvFilters.AdvContext;

    newParams.set("type", searchType);
    searchQuery && newParams.set(RAW_QUERY, searchQuery); // Used to generate pagination links
    advContext && newParams.set(ADV_CONTEXT, advContext);
    // @ts-ignore - Works fine with string | string[]
    Object.entries(mappedAdvFilters).forEach(([key, value]) => newParams.set(key, value));

    const subpage = !skipSubpage ? searchTypeMap[searchType] : "";
    const url = `/${locale}/${encodeURIComponent(searchQuery ?? "any")}${subpage}?${newParams.toString()}`;

    saveToHistory(searchQuery, url);
    window.location.href = url;
};

const saveToHistory = (search: string | undefined, url: string) => {
    if (!search) return;

    try {
        const history: SearchHistoryItem[] = JSON.parse(localStorage.getItem("history") ?? "[]");
        const formattedString = search.split("/").at(0);
        if (!formattedString) return;
        history.push({ keyword: formattedString, url });
        if (history.length > 5) history.shift();
        localStorage.setItem("history", JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save history", e);
    }
};

const mapFormDataToObj = (formData: [string, FormDataEntryValue][]): Record<string, string[] | string> => {
    return formData.reduce((result: Record<string, string[] | string>, [key, value]) => {
        // Check if first char is uppercase - We merge the values of the same key
        const isUpperCase = key.charAt(0) === key.charAt(0).toUpperCase();

        // No special treatment for lowercase keys
        if (!isUpperCase) {
            result[key] = value as string;
            return result;
        }

        // Add the value to the array
        if (result[key] === undefined) result[key] = [];
        (result[key] as string[]).push(value as string);

        return result;
    }, {});
};
