"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import FilterListError from "@/components/FilterListError";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import { COLLOCATION_WORD_CATEGORY } from "@/constants";
import { BiblFilter } from "@/data/filters";
import FilterableList from "@/design-system/filterable-list/FilterableList";
import { ParsedSearchFilters } from "@/types/search.types";
import axios from "axios";

export default function CollocationsWordClassesList({
    parsedFilters,
    currentLemma,
}: {
    parsedFilters: ParsedSearchFilters;
    currentLemma: string;
}) {
    const t = useTranslations("SearchResults.filters");
    // @ts-expect-error
    const tCat = useTranslations("Filters").raw("Category");
    const searchParams = useSearchParams();

    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: [
            "wordClass",
            parsedFilters.texts,
            parsedFilters.firstLang,
            parsedFilters.taskSetting,
            parsedFilters.proficSlv,
            parsedFilters.programType,
            parsedFilters.inputType,
            parsedFilters.errorsFilters,
            parsedFilters.collocationWordCategory,
            parsedFilters.formsFilter,
            parsedFilters.context,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios
                .get(`/api/filters/wordclass/collocations?lemma=${currentLemma}&${searchParams.toString()}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL })
                .then((res) => res.data),
    });

    if (isLoading) return <FilterListLoader titleLangKey="wordClass" />;
    if (error || !data) return <FilterListError titleLangKey="wordClass" />;

    return (
        <FilterableList
            title={t("wordClass")}
            rawLangMap={tCat}
            filterItems={data}
            showRel={parsedFilters.showRelative}
            paramName={COLLOCATION_WORD_CATEGORY}
            useLowecase={true}
            showSelectAll={true}
        />
    );
}
