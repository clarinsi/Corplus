"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import FilterListError from "@/components/FilterListError";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import { FORMS_FILTER, LEMMA, LIST_SEPARATOR, RAW_QUERY } from "@/constants";
import { BiblFilter } from "@/data/filters";
import { LemmaFormCount } from "@/data/lemma";
import FilterableList from "@/design-system/filterable-list/FilterableList";
import { ParsedSearchFilters } from "@/types/search.types";
import axios from "axios";

export default function LemmaFormsList({
    parsedFilters,
    currentLemma,
}: {
    parsedFilters: ParsedSearchFilters;
    currentLemma: string;
}) {
    const t = useTranslations("SearchResults.filters");
    const searchParams = useSearchParams();
    const filteredSearchParams = useMemo(() => {
        const newParams = new URLSearchParams(searchParams);
        const isMultiWord = searchParams.get(RAW_QUERY)?.includes(" ");
        if (parsedFilters.type === "basic" && !isMultiWord) {
            newParams.delete(LEMMA);
        }

        newParams.delete(FORMS_FILTER);
        return newParams;
    }, [parsedFilters, searchParams]);

    const { data, isLoading, error } = useQuery<LemmaFormCount[]>({
        queryKey: [
            "lemmaForms",
            parsedFilters.texts,
            parsedFilters.firstLang,
            parsedFilters.taskSetting,
            parsedFilters.proficSlv,
            parsedFilters.programType,
            parsedFilters.inputType,
            parsedFilters.errorsFilters,
            parsedFilters.wordCategory,
            parsedFilters.context,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios
                .get(`/api/lemma-forms/${currentLemma}/count?${filteredSearchParams.toString()}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL })
                .then((res) => res.data),
    });
    const mappedData: BiblFilter[] | undefined = useMemo(() => {
        return data?.map((d) => ({
            name: d.label,
            count: d.count,
            relative: d.relative,
        }));
    }, [data]);

    if (isLoading) return <FilterListLoader titleLangKey={"lemma-forms"} />;
    if (error || !data) return <FilterListError titleLangKey="lemma-forms" />;

    return (
        <FilterableList
            title={t("lemma-forms")}
            filterItems={mappedData}
            showRel={parsedFilters.showRelative}
            paramName={FORMS_FILTER}
            showSelectAll={true}
            listSeparator={LIST_SEPARATOR}
        />
    );
}
