"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SidebarFilterItem } from "@/components/filters/ErrorsSidebarFiltersList";
import { ERRORS_FILTER, LIST_SEPARATOR } from "@/constants";
import FilterableListCategory from "@/design-system/filterable-list/FilterableListCategory";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";
import { ParsedSearchFilters } from "@/types/search.types";
import { createUrl } from "@/util/util";

interface ErrorsSidebarFiltersProps {
    parsedFilters: ParsedSearchFilters;
    groupedErrors: SidebarFilterItem[];
}

export default function ErrorsSidebarFilters({ parsedFilters, groupedErrors }: ErrorsSidebarFiltersProps) {
    const t = useTranslations("SearchResults.filters");
    const tComm = useTranslations("Filters.Common");
    const title = t("errors");

    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilters = useMemo(() => searchParams.get(ERRORS_FILTER)?.split(LIST_SEPARATOR) ?? [], [searchParams]);
    const flattenedErrors = useMemo(() => groupedErrors.flatMap((i) => unflattenHelper(i.children)), [groupedErrors]);

    const handleFilterChange = (name: string | string[], isCategoryChecked: boolean) => {
        const names = Array.isArray(name) ? name : [name];

        names.forEach((item) => {
            if (!selectedFilters.includes(item)) {
                selectedFilters.push(item);
                return;
            }

            if (!isCategoryChecked) return;
            const index = selectedFilters.indexOf(item);
            selectedFilters.splice(index, 1);
        });

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("page");

        if (selectedFilters.length === 0) newSearchParams.delete(ERRORS_FILTER);
        else newSearchParams.set(ERRORS_FILTER, selectedFilters.join(LIST_SEPARATOR));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const areAllSelected = useMemo(() => {
        if (selectedFilters.length === 0) return false;
        return flattenedErrors.every((f) => selectedFilters.includes(f));
    }, [flattenedErrors, selectedFilters]);

    const onAllClick = () => {
        flattenedErrors.forEach((item) => {
            if (!selectedFilters.includes(item)) {
                selectedFilters.push(item);
                return;
            }

            if (!areAllSelected) return;
            const index = selectedFilters.indexOf(item);
            selectedFilters.splice(index, 1);
        });

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("page");

        if (selectedFilters.length === 0) newSearchParams.delete(ERRORS_FILTER);
        else newSearchParams.set(ERRORS_FILTER, selectedFilters.join(LIST_SEPARATOR));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    return (
        <div className="bg-white">
            {title && (
                <FilterableListHeader
                    title={title}
                    showSelectAll={true}
                    isChecked={areAllSelected}
                    onCheckClick={onAllClick}
                    hasCategories={true}
                />
            )}

            {groupedErrors.length === 0 && <p className="callout px-4 pb-3 text-grey">{tComm("no-results")}</p>}

            {groupedErrors.map((category) => (
                <FilterableListCategory
                    key={category.label}
                    parsedFilters={parsedFilters}
                    category={category}
                    selectedItems={selectedFilters}
                    onItemClick={handleFilterChange}
                    expandDefault={false}
                />
            ))}
        </div>
    );
}

const unflattenHelper = (items: SidebarFilterItem[] | undefined): string[] => {
    return (
        items?.flatMap((item) => {
            if (!item.children || item.children.length === 0) return item.value ?? [];
            return unflattenHelper(item.children);
        }) ?? []
    );
};
