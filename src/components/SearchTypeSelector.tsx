"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { SearchType } from "@/app/[locale]/Search";
import CaretDown from "@/assets/icons/CaretDown";
import RadioButtonCheckedIcon from "@/assets/icons/RadioButtonCheckedIcon";
import RadioButtonIcon from "@/assets/icons/RadioButtonIcon";
import FilterDropdown from "@/design-system/FilterDropdown";
import MenuListItem from "@/design-system/MenuListItem";

interface SearchTypeSelectorProps {
    bg: "light" | "emphasised";
    size: "xsmall" | "small" | "medium" | "large";
    selectedFilter: SearchType;
    handleFilterChange?: (name: string) => void;
}

export default function SearchTypeSelector({ bg, size, selectedFilter, handleFilterChange }: SearchTypeSelectorProps) {
    const t = useTranslations("Search.tab");
    const normalizedSelectedFilter: "basic" | "collocations" | "list" = useMemo(() => {
        if (selectedFilter === "exact") return "basic";
        return selectedFilter;
    }, [selectedFilter]);

    return (
        <FilterDropdown
            bg={bg}
            size={size}
            isActive={true}
            label={t(normalizedSelectedFilter)}
            leadingIcon={<CaretDown />}
        >
            <MenuListItem
                value="basic"
                isActive={selectedFilter === "basic" || selectedFilter === "exact"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("basic")}
            </MenuListItem>
            <MenuListItem
                value="collocations"
                isActive={selectedFilter === "collocations"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("collocations")}
            </MenuListItem>
            <MenuListItem
                value="list"
                isActive={selectedFilter === "list"}
                onClick={handleFilterChange}
                icon={<RadioButtonIcon />}
                activeIcon={<RadioButtonCheckedIcon />}
            >
                {t("list")}
            </MenuListItem>
        </FilterDropdown>
    );
}
