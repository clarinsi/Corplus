"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LIST_SEPARATOR } from "@/constants";
import { BiblFilter } from "@/data/filters";
import FilterableListBody from "@/design-system/filterable-list/FilterableListBody";
import FilterableListFooter from "@/design-system/filterable-list/FilterableListFooter";
import FilterableListHeader from "@/design-system/filterable-list/FilterableListHeader";
import { createUrl } from "@/util/util";

export interface FilterableListProps {
    title?: string;
    paramName: string;
    rawLangMap?: Record<string, string>;
    filterItems?: BiblFilter[];
    cutoff?: number;
    showRel?: boolean;
    disabledItems?: string[];
    showSelectAll?: boolean;
    useLowecase?: boolean;
    listSeparator?: string;
}

export default function FilterableList({
    title,
    paramName,
    rawLangMap = {},
    filterItems = [],
    cutoff = 8,
    showRel = false,
    disabledItems = [],
    showSelectAll = false,
    useLowecase = false,
    listSeparator = LIST_SEPARATOR,
}: FilterableListProps) {
    const t = useTranslations("Filters.Common");
    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilters = useMemo(
        () => searchParams.get(paramName)?.split(listSeparator) ?? [],
        [searchParams, paramName, listSeparator],
    );
    const [isExpanded, setIsExpanded] = useState(false);

    const handleFilterChange = (name: string) => {
        const newFilters = selectedFilters.includes(name)
            ? selectedFilters.filter((filter) => filter !== name)
            : [...selectedFilters, name];

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("page");

        if (newFilters.length === 0) newSearchParams.delete(paramName);
        else newSearchParams.set(paramName, newFilters.join(listSeparator));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const onFooterClick = () => {
        setIsExpanded(!isExpanded);
    };

    const sortedItems = useMemo(
        () => filterItems?.sort((a, b) => b[showRel ? "relative" : "count"] - a[showRel ? "relative" : "count"]),
        [filterItems, showRel],
    );

    const areAllSelected = useMemo(() => {
        if (selectedFilters.length === 0) return false;
        return filterItems.every((f) => selectedFilters.includes(f.name));
    }, [filterItems, selectedFilters]);

    const onAllClick = () => {
        filterItems.forEach((item) => {
            if (!selectedFilters.includes(item.name)) {
                selectedFilters.push(item.name);
                return;
            }

            if (!areAllSelected) return;
            const index = selectedFilters.indexOf(item.name);
            selectedFilters.splice(index, 1);
        });

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("page");

        if (selectedFilters.length === 0) newSearchParams.delete(paramName);
        else newSearchParams.set(paramName, selectedFilters.join(LIST_SEPARATOR));

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    return (
        <div className="bg-white">
            {title && (
                <FilterableListHeader
                    title={title}
                    showSelectAll={showSelectAll}
                    isChecked={areAllSelected}
                    onCheckClick={onAllClick}
                />
            )}

            {sortedItems?.length === 0 && <p className="callout px-4 pb-3 text-grey">{t("no-results")}</p>}

            {sortedItems.slice(0, cutoff).map((i) => {
                const label = rawLangMap[i.name] ?? i.name;
                return (
                    <FilterableListBody
                        key={i.name}
                        label={useLowecase ? label.toLowerCase() : label}
                        name={i.name}
                        freq={showRel ? i.relative : i.count}
                        onClick={handleFilterChange}
                        isActive={selectedFilters.includes(decodeURIComponent(i.name))}
                        isDisabled={disabledItems.includes(i.name)}
                    />
                );
            })}

            {sortedItems.length > cutoff && <FilterableListFooter isOpen={isExpanded} onClick={onFooterClick} />}
            {isExpanded && (
                <div className="pl-4">
                    {sortedItems.slice(cutoff, 30).map((i) => (
                        <FilterableListBody
                            key={i.name}
                            label={rawLangMap[i.name] ?? i.name}
                            name={i.name}
                            freq={showRel ? i.relative : i.count}
                            onClick={handleFilterChange}
                            isActive={selectedFilters.includes(i.name)}
                            isDisabled={disabledItems.includes(i.name)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
