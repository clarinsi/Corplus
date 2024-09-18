"use client";

import { useMemo, useState } from "react";
import ChevronDownIcon from "@/assets/icons/ChevronDownIcon";
import ChevronUpIcon from "@/assets/icons/ChevronUpIcon";
import { SidebarFilterItem } from "@/components/filters/ErrorsSidebarFiltersList";
import FilterableListBody from "@/design-system/filterable-list/FilterableListBody";
import { ParsedSearchFilters } from "@/types/search.types";
import { getCategoryItemsCodes, getCategoryValueSum } from "@/util/filter.util";

interface FilterableListCategoryProps {
    parsedFilters: ParsedSearchFilters;
    category: SidebarFilterItem;
    selectedItems: string[];
    onItemClick?: (name: string | string[], isCategoryChecked: boolean) => void;
    expandDefault?: boolean;
}

export default function FilterableListCategory({
    parsedFilters,
    category,
    selectedItems,
    onItemClick,
    expandDefault = false,
}: FilterableListCategoryProps) {
    const [isOpen, setIsOpen] = useState(expandDefault);
    const categoryItemsCodes = useMemo(() => getCategoryItemsCodes(category), [category]);
    const categorySum = useMemo(() => getCategoryValueSum(category), [category]);
    const openHandler = () => {
        setIsOpen(!isOpen);
    };

    const categorySelectHandler = () => {
        if (!onItemClick) return;
        onItemClick(categoryItemsCodes, isCategorySelected);
    };

    const isCategorySelected = useMemo(() => {
        return categoryItemsCodes.every((code) => selectedItems.includes(code));
    }, [categoryItemsCodes, selectedItems]);

    return (
        <>
            <FilterableListBody
                label={category.label}
                name={category.value ?? category.label}
                isActive={isCategorySelected}
                trailingIcon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
                onTrailingIconClick={openHandler}
                onClick={categorySelectHandler}
                freq={parsedFilters.showRelative ? categorySum.relativeCount : categorySum.count}
            />
            {isOpen && (
                <ul className="pl-8 bg-white">
                    {category.children?.map((item) => {
                        if (item.children?.length ?? 0 > 0) {
                            return (
                                <FilterableListCategory
                                    key={`${category.label}-${item.label}`}
                                    parsedFilters={parsedFilters}
                                    category={item}
                                    selectedItems={selectedItems}
                                    onItemClick={onItemClick}
                                    expandDefault={true}
                                />
                            );
                        }

                        if (!item.value) {
                            console.error("FilterableListCategory: item.value is undefined", item);
                            return;
                        }

                        return (
                            <FilterableListBody
                                key={item.value}
                                name={item.value}
                                label={item.label}
                                isActive={selectedItems.includes(item.value)}
                                onClick={() => onItemClick?.(item.value!, true)}
                                freq={parsedFilters.showRelative ? item.relative ?? -1 : item.count ?? -1}
                            />
                        );
                    })}
                </ul>
            )}
        </>
    );
}
