"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import FilterListError from "@/components/FilterListError";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import { BiblFilter } from "@/data/filters";
import { BiblInsert } from "@/db/schema";
import FilterableList from "@/design-system/filterable-list/FilterableList";
import { parseSearchParams } from "@/util/parsing.util";
import axios from "axios";

interface GenericSidebarFilterProps {
    currentLemma?: string;
    fieldName: keyof BiblInsert;
    paramName: string;
    titleLangKey: string;
    showRel: boolean;
    showSelectAll?: boolean;
}

export default function GenericSidebarFilter({
    currentLemma,
    fieldName,
    paramName,
    titleLangKey,
    showRel,
    showSelectAll = false,
}: GenericSidebarFilterProps) {
    const t = useTranslations("SearchResults.filters");
    // @ts-expect-error
    const title = t(titleLangKey);
    const searchParams = useSearchParams();
    const parsedFilters = parseSearchParams(searchParams);

    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: [
            paramName,
            parsedFilters.texts,
            parsedFilters.lemma,
            fieldName !== "FirstLang" && parsedFilters.firstLang,
            fieldName !== "TaskSetting" && parsedFilters.taskSetting,
            fieldName !== "ProficSlv" && parsedFilters.proficSlv,
            fieldName !== "ProgramType" && parsedFilters.programType,
            fieldName !== "InputType" && parsedFilters.inputType,
            parsedFilters.wordCategory,
            parsedFilters.errorsFilters,
            parsedFilters.collocationWordCategory,
            parsedFilters.formsFilter,
            parsedFilters.context,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios
                .get(`/api/filters/bibl/${fieldName}/${currentLemma}?${searchParams.toString()}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL })
                .then((res) => res.data),
    });

    if (isLoading) return <FilterListLoader titleLangKey={titleLangKey} />;
    if (error || !data) return <FilterListError titleLangKey={titleLangKey} />;

    return (
        <FilterableList
            paramName={paramName}
            title={title}
            showRel={showRel}
            filterItems={data}
            showSelectAll={showSelectAll}
        />
    );
}
