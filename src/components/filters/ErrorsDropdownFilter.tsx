"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import CaretDown from "@/assets/icons/CaretDown";
import CloseIcon from "@/assets/icons/CloseIcon";
import { ERRORS_FILTER, LIST_SEPARATOR, TEXTS_FILTER } from "@/constants";
import FilterDropdown from "@/design-system/FilterDropdown";
import { MenuListCategory } from "@/design-system/MenuListCategory";
import { createUrl } from "@/util/util";

export interface MappedErrorCode {
    code: string;
    category: string;
    name: string;
    problem: string;
}

export interface FilterItem {
    label: string;
    value?: string;
    children?: FilterItem[];
}

interface TmpFilterItem {
    label: string;
    value?: string;
    children?: Map<string, TmpFilterItem>;
}

const transformToFilterItems = (mappedErrorCodes: MappedErrorCode[]): FilterItem[] => {
    const categoryMap: Map<string, TmpFilterItem> = new Map();

    mappedErrorCodes.forEach((item) => {
        let itemCategory = categoryMap.get(item.category);
        if (!itemCategory) {
            itemCategory = {
                label: item.category,
                value: item.name !== undefined ? undefined : item.code,
                children: new Map(),
            };
            categoryMap.set(item.category, itemCategory);
        }

        let itemName = itemCategory.children?.get(item.name);
        if (!itemName) {
            itemName = {
                label: item.name,
                value: item.problem !== undefined ? undefined : item.code,
                children: new Map(),
            };
            itemCategory.children?.set(item.name, itemName);
        }

        if (item.problem !== undefined) {
            itemName.children?.set(item.problem, {
                label: item.problem,
                value: item.code,
            });
        }
    });

    return Array.from(categoryMap.entries()).map(([category, item]) => ({
        label: category,
        value: item.value,
        children: Array.from(item.children?.entries() ?? []).map(([name, item]) => ({
            label: name,
            value: item.value,
            children: Array.from(item.children?.values() ?? []).map((item) => ({
                label: item.label,
                value: item.value,
            })),
        })),
    }));
};

interface SpeakerLangFilterProps {
    bg: "light" | "emphasised";
    hierarchy?: "primary" | "ghost" | "advsearch";
    size: "small" | "medium" | "large";
}

export default function ErrorsDropdownFilter({ bg, hierarchy = "primary", size }: SpeakerLangFilterProps) {
    const t = useTranslations("Buttons.Errors");
    const tAll = useTranslations();

    const router = useRouter();
    const path = usePathname();
    const searchParams = useSearchParams();
    const selectedFilters = useMemo(() => searchParams.get(ERRORS_FILTER)?.split(LIST_SEPARATOR) ?? [], [searchParams]);
    const isActive = useMemo(() => selectedFilters.length > 0, [selectedFilters]);

    const mappedErrs: MappedErrorCode[] = useMemo(() => {
        // @ts-expect-error - next-intl limitation
        const rawErrs = tAll.raw("ErrorCodes") as { [key: string]: Omit<MappedErrorCode, "code"> };
        return Object.entries(rawErrs).map(([key, value]) => ({
            code: key,
            ...value,
        }));
    }, [tAll]);
    const groupedErrs = useMemo(() => transformToFilterItems(mappedErrs), [mappedErrs]);

    const handleFilterChange = (name: string | string[], isCategoryChecked: boolean = false) => {
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

        if (selectedFilters.length === 0) newSearchParams.delete(ERRORS_FILTER);
        else newSearchParams.set(ERRORS_FILTER, selectedFilters.join(LIST_SEPARATOR));

        // Search only for texts with errors
        newSearchParams.set(TEXTS_FILTER, "with-error");
        newSearchParams.delete("page");

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const trailingIcon = useMemo(() => {
        if (!isActive) return <CaretDown />;
        return <CloseIcon />;
    }, [isActive]);

    const onTrailingClick = () => {
        if (!isActive) return;

        // Clear filters
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete(ERRORS_FILTER);
        newSearchParams.delete("page");

        router.replace(createUrl(path, newSearchParams), { scroll: false });
    };

    const label = useMemo(() => {
        if (selectedFilters.length === 0) return t("label");
        const firstFilter = selectedFilters.at(0)!;
        const selectedError = mappedErrs.find((lang) => lang.code === firstFilter);
        let output = `${selectedError?.category}/${selectedError?.name}` ?? firstFilter;
        if (selectedFilters.length > 1) output += ` + ${selectedFilters.length - 1}`;
        return output;
    }, [mappedErrs, selectedFilters, t]);

    return (
        <FilterDropdown
            bg={bg}
            hiearchy={hierarchy}
            size={size}
            isActive={isActive}
            isMultiChoice={true}
            label={label}
            trailingIcon={trailingIcon}
            onTrailingIconClick={isActive ? onTrailingClick : undefined}
        >
            <div className="w-80">
                {groupedErrs.map((category) => (
                    <MenuListCategory
                        key={category.label}
                        category={category}
                        selectedItems={selectedFilters}
                        onItemClick={handleFilterChange}
                    />
                ))}
            </div>
        </FilterDropdown>
    );
}
