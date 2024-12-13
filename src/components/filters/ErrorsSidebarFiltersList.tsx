"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import FilterListError from "@/components/FilterListError";
import { FilterItem, MappedErrorCode } from "@/components/filters/ErrorsDropdownFilter";
import ErrorsSidebarFilters from "@/components/filters/ErrorsSidebarFilters";
import FilterListLoader from "@/components/loaders/FilterListLoader";
import { BiblFilter } from "@/data/filters";
import { ParsedSearchFilters } from "@/types/search.types";
import axios from "axios";

export interface SidebarFilterItem {
    label: string;
    value?: string;
    count?: number;
    relative?: number;
    children?: SidebarFilterItem[];
}

interface TmpSidebarFilterItem {
    label: string;
    value?: string;
    count?: number;
    relative?: number;
    children?: Map<string, TmpSidebarFilterItem>;
}

type SidebarError = MappedErrorCode & {
    count: number;
    relative: number;
};

const transformToFilterItems = (mappedErrorCodes: SidebarError[]): FilterItem[] => {
    // Create a mapping of categories to names to problems
    const categoryMap: Map<string, TmpSidebarFilterItem> = new Map();

    mappedErrorCodes.forEach((item) => {
        let itemCategory = categoryMap.get(item.category);
        if (!itemCategory) {
            itemCategory = {
                label: item.category,
                value: item.name !== undefined ? undefined : item.code,
                count: item.count,
                relative: item.relative,
                children: new Map(),
            };
            categoryMap.set(item.category, itemCategory);
        }

        let itemName = itemCategory.children?.get(item.name);
        if (!itemName) {
            itemName = {
                label: item.name,
                value: item.problem !== undefined ? undefined : item.code,
                count: item.count,
                relative: item.relative,
                children: new Map(),
            };
            itemCategory.children?.set(item.name, itemName);
        }

        if (item.problem !== undefined) {
            itemName.children?.set(item.problem, {
                label: item.problem,
                value: item.code,
                count: item.count,
                relative: item.relative,
            });
        }
    });

    return Array.from(categoryMap.entries()).map(([category, item]) => ({
        label: category,
        value: item.value,
        count: item.count,
        relative: item.relative,
        children: Array.from(item.children?.entries() ?? []).map(([name, item]) => ({
            label: name,
            value: item.value,
            count: item.count,
            relative: item.relative,
            children: Array.from(item.children?.values() ?? []).map((item) => ({
                label: item.label,
                value: item.value,
                count: item.count,
                relative: item.relative,
            })),
        })),
    }));
};

interface ErrorsSidebarFiltersListProps {
    parsedFilters: ParsedSearchFilters;
}

export default function ErrorsSidebarFiltersList({ parsedFilters }: ErrorsSidebarFiltersListProps) {
    const tAll = useTranslations();
    // @ts-expect-error
    const tErrors = tAll.raw("ErrorCodes");

    const searchParams = useSearchParams();
    const { data, isLoading, error } = useQuery<BiblFilter[]>({
        queryKey: [
            parsedFilters.texts,
            parsedFilters.lemma,
            parsedFilters.firstLang,
            parsedFilters.taskSetting,
            parsedFilters.proficSlv,
            parsedFilters.programType,
            parsedFilters.inputType,
            parsedFilters.wordCategory,
            parsedFilters.collocationWordCategory,
            parsedFilters.formsFilter,
            parsedFilters.context,
        ],
        queryFn: async ({ signal }: { signal: AbortSignal }) =>
            axios.get(`/api/errs?${searchParams.toString()}`, { signal, baseURL: process.env.NEXT_PUBLIC_BASE_URL }).then((res) => res.data),
    });

    if (isLoading) return <FilterListLoader titleLangKey="errors" />;
    if (error || !data) return <FilterListError titleLangKey="errors" />;

    const langMappedErrors: SidebarError[] = data.flatMap((e) => {
        const langEntry = tErrors[e.name];
        if (!langEntry) {
            return [];
        }

        return {
            category: langEntry.category,
            name: langEntry.name,
            problem: langEntry.problem,
            code: e.name,
            count: e.count,
            relative: e.relative,
        };
    });
    const groupedErrors = transformToFilterItems(langMappedErrors);

    return <ErrorsSidebarFilters parsedFilters={parsedFilters} groupedErrors={groupedErrors} />;
}
